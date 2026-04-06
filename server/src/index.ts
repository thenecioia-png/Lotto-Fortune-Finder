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

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'aurum-numeros-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Rutas API
app.use('/api/auth', authRouter);
app.use('/api/lottery', lotteryRouter);
app.use('/api/dreams', dreamsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Servir el frontend React (carpeta dist del cliente)
const clientDist = join(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Todas las rutas que no sean /api devuelven el index.html (SPA)
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n✨ Aurum Números corriendo en http://localhost:${PORT}\n`);
});
