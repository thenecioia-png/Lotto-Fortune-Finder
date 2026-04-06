import { Router } from 'express';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import db from '../db.js';

export const scraperRouter = Router();

// ─── Configuración de loterías a scrappear ─────────────────────────────────
const LOTERIAS = [
  { nombre: 'Nacional',  sorteo: 'tarde',  slug: 'loteria-nacional-primera' },
  { nombre: 'Nacional',  sorteo: 'noche',  slug: 'loteria-nacional-segunda' },
  { nombre: 'Leidsa',    sorteo: 'tarde',  slug: 'leidsa-quiniela-pale' },
  { nombre: 'Leidsa',    sorteo: 'noche',  slug: 'leidsa-super-kino-tv' },
  { nombre: 'Loteka',    sorteo: 'noche',  slug: 'loteka-quiniela-loteka' },
  { nombre: 'Real',      sorteo: 'tarde',  slug: 'loteria-real-quiniela-real' },
  { nombre: 'Real',      sorteo: 'noche',  slug: 'loteria-real-real-jugada' },
  { nombre: 'New York',  sorteo: 'tarde',  slug: 'new-york-numbers-midday' },
  { nombre: 'New York',  sorteo: 'noche',  slug: 'new-york-numbers-evening' },
];

function hoyISO() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// ─── Scraper principal ──────────────────────────────────────────────────────
export async function scrapearLoterias(): Promise<void> {
  const fecha = hoyISO();
  console.log(`\n🔍 Scraping loterías ${fecha}…`);

  for (const lot of LOTERIAS) {
    try {
      const url = `https://enloteria.com/${lot.slug}/`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AurumBot/1.0)' },
      });
      if (!res.ok) { console.warn(`  ⚠ HTTP ${res.status} — ${lot.nombre} ${lot.sorteo}`); continue; }

      const html = await res.text();
      const $    = cheerio.load(html);

      // enloteria.com muestra los números en .result-number, .winning-number, td.number o similares
      const numeros = extraerNumeros($);

      if (!numeros) {
        console.warn(`  ⚠ Sin números — ${lot.nombre} ${lot.sorteo}`);
        continue;
      }

      // Upsert: si ya existe el registro de hoy, lo actualiza; si no, inserta
      const existe = db.prepare(
        `SELECT id FROM resultados_loteria WHERE loteria=? AND sorteo=? AND fecha=?`
      ).get(lot.nombre, lot.sorteo, fecha);

      if (existe) {
        db.prepare(
          `UPDATE resultados_loteria SET numeros=?, creado_en=datetime('now') WHERE loteria=? AND sorteo=? AND fecha=?`
        ).run(numeros, lot.nombre, lot.sorteo, fecha);
      } else {
        db.prepare(
          `INSERT INTO resultados_loteria (loteria, sorteo, numeros, fecha) VALUES (?,?,?,?)`
        ).run(lot.nombre, lot.sorteo, numeros, fecha);
      }
      console.log(`  ✅ ${lot.nombre} ${lot.sorteo}: ${numeros}`);
    } catch (err) {
      console.error(`  ✗ Error — ${lot.nombre} ${lot.sorteo}:`, (err as Error).message);
    }
  }
  console.log('🏁 Scraping completado\n');
}

// ─── Extracción de números desde el HTML ───────────────────────────────────
function extraerNumeros($: cheerio.CheerioAPI): string | null {
  // Intentamos varios selectores comunes de sitios de loterías
  const candidatos: string[] = [];

  // Selector 1: celdas de resultado con clases típicas
  $('[class*="result"] [class*="number"], [class*="winning"], [class*="ball"], td.number, .num, .result-num').each((_, el) => {
    const t = $(el).text().trim().replace(/\D+/g, '');
    if (t.length >= 1 && t.length <= 3) candidatos.push(t.padStart(2, '0'));
  });

  if (candidatos.length >= 2) return candidatos.slice(0, 3).join('-');

  // Selector 2: buscar números en tablas de resultados
  $('table tr').each((_, row) => {
    const cells = $(row).find('td').map((_, td) => $(td).text().trim()).get();
    const nums = cells.filter(c => /^\d{1,3}$/.test(c));
    if (nums.length >= 2) nums.forEach(n => candidatos.push(n.padStart(2, '0')));
  });

  if (candidatos.length >= 2) return candidatos.slice(0, 3).join('-');

  // Selector 3: extracción por regex — números aislados de 2 dígitos en el body
  const texto = $('body').text();
  const matches = texto.match(/\b\d{2}\b/g) || [];
  const unicos = [...new Set(matches)].slice(0, 3);
  if (unicos.length >= 2) return unicos.join('-');

  return null;
}

// ─── Cron: ejecutar cada hora en el minuto 5 ───────────────────────────────
export function iniciarCron() {
  // Ejecutar al inicio para tener datos frescos
  scrapearLoterias().catch(console.error);

  // Luego cada hora (HH:05)
  cron.schedule('5 * * * *', () => {
    scrapearLoterias().catch(console.error);
  });

  console.log('⏰ Cron de scraping activado (cada hora en el minuto :05)');
}

// ─── Endpoint GET /api/resultados-hoy ──────────────────────────────────────
scraperRouter.get('/resultados-hoy', (_req, res) => {
  try {
    const fecha = hoyISO();
    const rows = db.prepare(
      `SELECT loteria, sorteo, numeros, fecha, creado_en
       FROM resultados_loteria
       WHERE fecha = ?
       ORDER BY loteria, sorteo`
    ).all(fecha) as { loteria: string; sorteo: string; numeros: string; fecha: string; creado_en: string }[];

    res.json({ fecha, resultados: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
});

// ─── Endpoint GET /api/resultados-historial (últimos 7 días) ───────────────
scraperRouter.get('/resultados-historial', (_req, res) => {
  try {
    const rows = db.prepare(
      `SELECT loteria, sorteo, numeros, fecha, creado_en
       FROM resultados_loteria
       WHERE fecha >= date('now', '-7 days')
       ORDER BY fecha DESC, loteria, sorteo`
    ).all() as { loteria: string; sorteo: string; numeros: string; fecha: string; creado_en: string }[];

    res.json({ resultados: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ─── Endpoint POST /api/resultados-forzar (admin: forzar scraping manual) ──
scraperRouter.post('/resultados-forzar', async (req, res) => {
  if (!(req.session as any).isAdmin) {
    return void res.status(403).json({ error: 'No autorizado' });
  }
  try {
    await scrapearLoterias();
    res.json({ ok: true, mensaje: 'Scraping completado' });
  } catch (err) {
    res.status(500).json({ error: 'Error en scraping' });
  }
});
