const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const rows = db.prepare(`SELECT n.*, c.complaint_id FROM notifications n
    LEFT JOIN complaints c ON c.id = n.complaint_id
    WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 50`).all(req.user.id);
  res.json(rows);
});

router.get('/unread-count', auth, (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);
  res.json({ count: row.c });
});

router.patch('/:id/read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

router.patch('/read-all', auth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
