import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const user = db.prepare('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_goals,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_goals
      FROM goals
      WHERE (created_by = ? OR (partner_id = ? AND partner_status = 'accepted'))
        AND status != 'cancelled'
    `).get(userId, userId) as any;

    res.json({ ...user, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const query = req.query.q as string;

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const users = db.prepare(`
      SELECT id, name, email, avatar_url 
      FROM users 
      WHERE id != ? AND (name LIKE ? OR email LIKE ?)
      LIMIT 10
    `).all(userId, `%${query}%`, `%${query}%`);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
