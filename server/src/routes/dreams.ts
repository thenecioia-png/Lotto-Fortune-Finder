import { Router, Request, Response } from 'express';
import db from '../db.js';
import OpenAI from 'openai';

export const dreamsRouter = Router();

// Charada / diccionario de sueños dominicano (extracto clásico)
const DREAM_DICT: Record<string, { numbers: string[]; meaning: string }> = {
  agua: { numbers: ['04', '18', '36'], meaning: 'El agua en sueños simboliza pureza, renovación y flujo de energía.' },
  mar: { numbers: ['11', '33', '55'], meaning: 'El mar representa la vastedad del subconsciente y oportunidades infinitas.' },
  dinero: { numbers: ['10', '20', '30'], meaning: 'Soñar con dinero anuncia abundancia y prosperidad.' },
  oro: { numbers: ['01', '07', '21'], meaning: 'El oro simboliza riqueza, poder y éxito próximo.' },
  muerto: { numbers: ['08', '13', '40'], meaning: 'Los muertos en sueños traen mensajes importantes del más allá.' },
  perro: { numbers: ['02', '22', '44'], meaning: 'El perro representa lealtad y amistad verdadera.' },
  gato: { numbers: ['03', '33', '66'], meaning: 'El gato simboliza intuición y misterio.' },
  culebra: { numbers: ['09', '19', '39'], meaning: 'La culebra anuncia traición o transformación radical.' },
  árbol: { numbers: ['05', '15', '25'], meaning: 'El árbol representa fortaleza, familia y crecimiento.' },
  fuego: { numbers: ['06', '16', '26'], meaning: 'El fuego anuncia pasión y cambios intensos próximos.' },
  casa: { numbers: ['14', '24', '34'], meaning: 'La casa simboliza tu vida interior y estabilidad familiar.' },
  caballo: { numbers: ['17', '37', '57'], meaning: 'El caballo trae libertad y éxito en los negocios.' },
  volar: { numbers: ['12', '32', '52'], meaning: 'Volar en sueños anuncia ascenso y superación de obstáculos.' },
  niño: { numbers: ['23', '43', '63'], meaning: 'El niño simboliza inocencia, nuevos comienzos y alegría.' },
  luna: { numbers: ['28', '48', '68'], meaning: 'La luna gobierna los ciclos y anuncia cambios emocionales.' },
  sol: { numbers: ['29', '49', '69'], meaning: 'El sol trae claridad, éxito y reconocimiento.' },
  pez: { numbers: ['27', '47', '67'], meaning: 'El pez simboliza abundancia y buenas noticias inesperadas.' },
  flores: { numbers: ['31', '51', '71'], meaning: 'Las flores anuncian amor, alegría y celebraciones próximas.' },
  sangre: { numbers: ['38', '58', '78'], meaning: 'La sangre en sueños anuncia fuerza vital o situaciones intensas.' },
  dios: { numbers: ['99', '77', '11'], meaning: 'Soñar con lo divino trae bendiciones y protección espiritual.' },
};

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.keys(DREAM_DICT).filter(key => lower.includes(key));
}

function getLocalInterpretation(dreamText: string): { interpretation: string; numbers: string[] } {
  const keywords = extractKeywords(dreamText);
  const numbers: string[] = [];
  const meanings: string[] = [];

  if (keywords.length > 0) {
    for (const kw of keywords.slice(0, 3)) {
      const entry = DREAM_DICT[kw];
      entry.numbers.forEach(n => {
        if (!numbers.includes(n)) numbers.push(n);
      });
      meanings.push(entry.meaning);
    }
  }

  if (numbers.length === 0) {
    let hash = 0;
    for (const ch of dreamText) {
      hash = ((hash << 5) - hash) + ch.charCodeAt(0);
      hash |= 0;
    }
    let s = Math.abs(hash);
    while (numbers.length < 3) {
      const n = (s % 100).toString().padStart(2, '0');
      if (!numbers.includes(n)) numbers.push(n);
      s = Math.floor(s / 7) + 13;
      if (s === 0) s = 42;
    }
  }

  const interpretation = meanings.length > 0
    ? `🌙 *Interpretación de tu sueño*\n\n${meanings.join(' ')}\n\nSegún la tradición numerológica dominicana, tu sueño vibra con los números: ${numbers.join(', ')}. Estos números tienen una fuerte resonancia espiritual para ti hoy.`
    : `🌙 *Interpretación de tu sueño*\n\nTu sueño revela mensajes profundos de tu subconsciente. La energía que percibes se alinea místicamente con los números: ${numbers.join(', ')}. Medita sobre estos números antes de jugar.`;

  return { interpretation, numbers };
}

dreamsRouter.post('/interpret', async (req: Request, res: Response) => {
  const { dreamText } = req.body;

  if (!dreamText || dreamText.trim().length < 5) {
    res.status(400).json({ error: 'Describe tu sueño con más detalle' });
    return;
  }

  let interpretation: string;
  let numbers: string[];

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres Aurum IA, un experto en numerología y sueños de la República Dominicana.
Cuando el usuario describe un sueño, lo interpretas en español dominicano con un tono místico y dorado.
Extraes entre 3 y 5 números de 2 dígitos (00-99) relacionados con los símbolos del sueño.
Responde en formato JSON: { "interpretation": "...", "numbers": ["01","22","37"] }
Mantén la respuesta breve pero poética.`,
          },
          { role: 'user', content: dreamText },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      interpretation = result.interpretation || '';
      numbers = result.numbers || [];
    } catch {
      const local = getLocalInterpretation(dreamText);
      interpretation = local.interpretation;
      numbers = local.numbers;
    }
  } else {
    const local = getLocalInterpretation(dreamText);
    interpretation = local.interpretation;
    numbers = local.numbers;
  }

  if (req.session.userId) {
    db.prepare(
      'INSERT INTO dream_interpretations (user_id, dream_text, interpretation, numbers) VALUES (?, ?, ?, ?)'
    ).run(req.session.userId, dreamText, interpretation, JSON.stringify(numbers));
  }

  res.json({ interpretation, numbers });
});

dreamsRouter.get('/history', (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const history = db.prepare(
    'SELECT id, dream_text, interpretation, numbers, created_at FROM dream_interpretations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.session.userId);

  res.json({ history });
});
