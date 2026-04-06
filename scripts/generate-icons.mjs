// Genera íconos PNG para PWA usando solo Node.js built-in (sin deps externas)
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../client/public');
mkdirSync(OUT, { recursive: true });

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = -1;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}

function makePNG(w, h, pixel) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pixel(x, y);
      const i = y * (w * 4 + 1) + 1 + x * 4;
      raw[i] = r; raw[i+1] = g; raw[i+2] = b; raw[i+3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function generateIcon(size, path) {
  const cx = size / 2, cy = size / 2;
  const outer = size * 0.46;
  const inner = size * 0.30;

  const png = makePNG(size, size, (x, y) => {
    const dx = x - cx, dy = y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < inner) {
      // Centro: dorado brillante
      const t = 1 - d / inner;
      return [
        Math.min(255, Math.round(196 + t * 30)),
        Math.min(255, Math.round(146 + t * 40)),
        Math.round(10 + t * 5),
        255
      ];
    } else if (d < outer) {
      // Anillo: dorado oscuro
      const t = (d - inner) / (outer - inner);
      return [
        Math.round(196 * (1 - t * 0.4)),
        Math.round(146 * (1 - t * 0.5)),
        10,
        255
      ];
    } else {
      // Borde suavizado
      const aa = Math.max(0, 1 - (d - outer) / (size * 0.015));
      return [
        Math.round(140 * aa),
        Math.round(100 * aa),
        10,
        Math.round(255 * aa)
      ];
    }
  });

  writeFileSync(path, png);
  console.log(`✓ Icono generado: ${path} (${size}x${size})`);
}

generateIcon(192, join(OUT, 'icon-192.png'));
generateIcon(512, join(OUT, 'icon-512.png'));
generateIcon(180, join(OUT, 'apple-touch-icon.png'));
console.log('✅ Todos los iconos PNG generados');
