import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { authRouter } from './routes/auth.js';
import { lotteryRouter } from './routes/lottery.js';
import { dreamsRouter } from './routes/dreams.js';
import { adminRouter } from './routes/admin.js';
import { chatRouter } from './routes/chat.js';
import './db.js'; // Inicializar BD

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    isAdmin: boolean;
  }
}

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'aurum-numeros-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRouter);
app.use('/api/lottery', lotteryRouter);
app.use('/api/dreams', dreamsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`\n✨ Aurum Números API corriendo en http://localhost:${PORT}`);
  console.log(`   Frontend esperado en ${CLIENT_URL}\n`);
});
