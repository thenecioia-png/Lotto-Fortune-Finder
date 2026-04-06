import { Router, Request, Response } from 'express';
import db from '../db.js';

export const adminRouter = Router();

function requireAdmin(req: Request, res: Response, next: () => void) {
  if (!req.session.userId || !req.session.isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }
  next();
}

adminRouter.get('/users', requireAdmin, (_req: Request, res: Response) => {
  const users = db.prepare(
    'SELECT id, username, email, name, is_admin, subscription_status, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json({ users });
});

adminRouter.get('/stats', requireAdmin, (_req: Request, res: Response) => {
  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const activeSubscriptions = (db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_status = 'active'").get() as any).count;
  const totalDreams = (db.prepare('SELECT COUNT(*) as count FROM dream_interpretations').get() as any).count;
  const totalMessages = (db.prepare('SELECT COUNT(*) as count FROM messages').get() as any).count;

  res.json({
    totalUsers,
    activeSubscriptions,
    totalDreams,
    totalMessages,
    monthlyRevenue: activeSubscriptions * 5,
  });
});

adminRouter.put('/users/:id/admin', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(isAdmin ? 1 : 0, id);
  res.json({ ok: true });
});

adminRouter.delete('/users/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  if (parseInt(id) === req.session.userId) {
    res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    return;
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});
