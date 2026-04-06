import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { authRouter } from './routes/auth.js';
import { lotteryRouter } from './routes/lottery.js';
import { dreamsRouter } from './routes/dreams.js';
import { adminRouter } from './routes/admin.js';
import { chatRouter } from './routes/chat.js';
import { scraperRouter, iniciarCron } from './routes/scraper.js';
import './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    isAdmin: boolean;
  }
}

// Render (y cualquier hosting) pone un proxy delante — necesario para HTTPS y sesiones
app.set('trust proxy', 1);

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'aurum-numeros-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// Rutas API
app.use('/api/auth', authRouter);
app.use('/api/lottery', lotteryRouter);
app.use('/api/dreams', dreamsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);
app.use('/api', scraperRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Servir el frontend React (carpeta dist del cliente)
// Funciona tanto corriendo desde server/src/ como desde la raíz del monorepo
const possibleDist = [
  join(__dirname, '../../client/dist'),   // tsx server/src/index.ts (desde raíz)
  join(__dirname, '../client/dist'),       // por si acaso
  join(process.cwd(), 'client/dist'),     // desde cualquier directorio de trabajo
];
const clientDist = possibleDist.find(existsSync) || possibleDist[0];

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
} else {
  console.warn('⚠️  No se encontró client/dist — ejecuta npm run build primero');
}

app.listen(PORT, () => {
  console.log(`\n✨ Aurum Números corriendo en http://localhost:${PORT}\n`);
  iniciarCron();
});
