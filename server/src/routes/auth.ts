import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

export const authRouter = Router();

authRouter.post('/register', (req: Request, res: Response) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Todos los campos son obligatorios' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    res.status(409).json({ error: 'El usuario o email ya existe' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, email, password, name) VALUES (?, ?, ?, ?)'
  ).run(username, email, hash, name || username);

  req.session.userId = result.lastInsertRowid as number;
  req.session.username = username;
  req.session.isAdmin = false;

  res.status(201).json({ id: result.lastInsertRowid, username, email, name: name || username, isAdmin: false });
});

authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.isAdmin = user.is_admin === 1;

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin === 1,
    subscriptionStatus: user.subscription_status,
  });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

authRouter.get('/user', (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }

  const user = db.prepare('SELECT id, username, email, name, is_admin, subscription_status FROM users WHERE id = ?')
    .get(req.session.userId) as any;

  if (!user) {
    res.json({ user: null });
    return;
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin === 1,
      subscriptionStatus: user.subscription_status,
    }
  });
});
