import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const goals = db.prepare(`
      SELECT g.*, 
             u1.name as creator_name,
             u2.name as partner_name,
             COALESCE((SELECT SUM(value) FROM progress_entries WHERE goal_id = g.id), 0) as current_value
      FROM goals g
      JOIN users u1 ON g.created_by = u1.id
      LEFT JOIN users u2 ON g.partner_id = u2.id
      WHERE (g.created_by = ? OR (g.partner_id = ? AND g.partner_status = 'accepted') OR (g.partner_id = ? AND g.partner_status = 'pending'))
        AND g.status != 'cancelled'
      ORDER BY g.created_at DESC
    `).all(userId, userId, userId) as any[];

    const formattedGoals = goals.map(g => ({
      ...g,
      percentage: Math.min(100, Math.round((g.current_value / g.target_value) * 100))
    }));

    res.json(formattedGoals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { title, description, type, target_value, unit, deadline, partner_id } = req.body;

  if (!title || !type || !target_value || !unit || !deadline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type === 'dupla' && !partner_id) {
    return res.status(400).json({ error: 'Partner ID is required for dupla goals' });
  }

  try {
    if (type === 'dupla') {
      if (partner_id === userId) {
        return res.status(400).json({ error: 'Você não pode convidar a si mesmo' });
      }
      const partner = db.prepare('SELECT id FROM users WHERE id = ?').get(partner_id);
      if (!partner) {
        return res.status(400).json({ error: 'Parceiro inválido' });
      }
    }

    const partnerStatus = type === 'dupla' ? 'pending' : null;
    const pId = type === 'dupla' ? partner_id : null;

    const result = db.prepare(`
      INSERT INTO goals (title, description, type, target_value, unit, deadline, created_by, partner_id, partner_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description || null, type, target_value, unit, deadline, userId, pId, partnerStatus);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  try {
    const goal = db.prepare(`
      SELECT g.*, 
             u1.name as creator_name,
             u2.name as partner_name,
             COALESCE((SELECT SUM(value) FROM progress_entries WHERE goal_id = g.id), 0) as current_value
      FROM goals g
      JOIN users u1 ON g.created_by = u1.id
      LEFT JOIN users u2 ON g.partner_id = u2.id
      WHERE g.id = ? AND (g.created_by = ? OR (g.partner_id = ? AND g.partner_status IN ('accepted','pending')))
    `).get(goalId, userId, userId) as any;

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.percentage = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));

    const entries = db.prepare(`
      SELECT p.*, u.name as user_name
      FROM progress_entries p
      JOIN users u ON p.user_id = u.id
      WHERE p.goal_id = ?
      ORDER BY p.date DESC, p.created_at DESC
    `).all(goalId);

    res.json({ ...goal, entries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;
  const { title, description, target_value, unit, deadline } = req.body;

  try {
    const goal = db.prepare('SELECT created_by FROM goals WHERE id = ?').get(goalId) as any;
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (goal.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });

    db.prepare(`
      UPDATE goals 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          target_value = COALESCE(?, target_value),
          unit = COALESCE(?, unit),
          deadline = COALESCE(?, deadline)
      WHERE id = ?
    `).run(title, description, target_value, unit, deadline, goalId);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  try {
    const goal = db.prepare('SELECT created_by FROM goals WHERE id = ?').get(goalId) as any;
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (goal.created_by !== userId) return res.status(403).json({ error: 'Forbidden' });

    db.prepare("UPDATE goals SET status = 'cancelled' WHERE id = ?").run(goalId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/progress', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;
  const { value, note, date } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(goalId) as any;
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    
    if (goal.created_by !== userId && (goal.partner_id !== userId || goal.partner_status !== 'accepted')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const entryDate = date || new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO progress_entries (goal_id, user_id, value, note, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(goalId, userId, value, note || null, entryDate);

    // Check if completed
    const currentTotal = db.prepare('SELECT SUM(value) as total FROM progress_entries WHERE goal_id = ?').get(goalId) as any;
    if (currentTotal.total >= goal.target_value && goal.status !== 'completed') {
      db.prepare("UPDATE goals SET status = 'completed' WHERE id = ?").run(goalId);
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/accept', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  try {
    const goal = db.prepare('SELECT partner_id, partner_status FROM goals WHERE id = ?').get(goalId) as any;
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (goal.partner_id !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (goal.partner_status !== 'pending') return res.status(400).json({ error: 'Not pending' });

    db.prepare("UPDATE goals SET partner_status = 'accepted' WHERE id = ?").run(goalId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/reject', (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const goalId = req.params.id;

  try {
    const goal = db.prepare('SELECT partner_id, partner_status FROM goals WHERE id = ?').get(goalId) as any;
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    if (goal.partner_id !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (goal.partner_status !== 'pending') return res.status(400).json({ error: 'Not pending' });

    db.prepare("UPDATE goals SET partner_status = 'rejected' WHERE id = ?").run(goalId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
