const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/(png|jpe?g|gif|webp)|application\/pdf)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files or PDFs are allowed'), ok);
  },
});

const CATEGORIES = ['Academics', 'Infrastructure', 'Facilities', 'Hostel', 'Transport', 'Administration', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'Under Review', 'Resolved', 'Rejected'];

function nextComplaintId() {
  const year = new Date().getFullYear();
  const row = db.prepare("SELECT complaint_id FROM complaints WHERE complaint_id LIKE ? ORDER BY id DESC LIMIT 1")
    .get(`CMP-${year}-%`);
  let seq = 1000;
  if (row) {
    const n = parseInt(row.complaint_id.split('-')[2], 10);
    if (!isNaN(n)) seq = Math.max(seq, n);
  }
  return `CMP-${year}-${seq + 1}`;
}

// Teacher: stats
router.get('/stats/summary', auth, requireRole('teacher'), (req, res) => {
  const row = db.prepare(`SELECT COUNT(*) total,
    SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) pending,
    SUM(CASE WHEN status='Under Review' THEN 1 ELSE 0 END) underReview,
    SUM(CASE WHEN status='Resolved' THEN 1 ELSE 0 END) resolved,
    SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) rejected FROM complaints`).get();
  res.json(row);
});

// Student: create
router.post('/', auth, requireRole('student'), upload.single('attachment'), (req, res) => {
  const { title, category, description, priority } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  if (!category || !CATEGORIES.includes(category)) return res.status(400).json({ error: 'Valid category is required' });
  if (!description || !description.trim()) return res.status(400).json({ error: 'Description is required' });
  if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Valid priority is required' });

  const cid = nextComplaintId();
  const attachment = req.file ? `/uploads/${req.file.filename}` : null;
  const info = db.prepare(`INSERT INTO complaints (complaint_id,student_id,title,category,description,attachment,priority,status)
    VALUES (?,?,?,?,?,?,?,'Pending')`)
    .run(cid, req.user.id, title.trim(), category, description.trim(), attachment, priority);
  const created = db.prepare('SELECT * FROM complaints WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// List (role aware, filters)
router.get('/', auth, (req, res) => {
  const { status, category, priority, date, search } = req.query;
  let sql = `SELECT c.*, u.name AS student_name, u.email AS student_email
             FROM complaints c JOIN users u ON u.id = c.student_id WHERE 1=1`;
  const params = [];
  if (req.user.role === 'student') { sql += ' AND c.student_id = ?'; params.push(req.user.id); }
  if (status && STATUSES.includes(status)) { sql += ' AND c.status = ?'; params.push(status); }
  if (category) { sql += ' AND c.category = ?'; params.push(category); }
  if (priority && PRIORITIES.includes(priority)) { sql += ' AND c.priority = ?'; params.push(priority); }
  if (date) { sql += " AND date(c.created_at) = date(?)"; params.push(date); }
  if (search && req.user.role === 'teacher') {
    sql += ' AND (c.complaint_id LIKE ? OR u.name LIKE ? OR c.title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY c.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Detail
router.get('/:id', auth, (req, res) => {
  const id = req.params.id;
  const c = db.prepare(`SELECT c.*, u.name AS student_name, u.email AS student_email
    FROM complaints c JOIN users u ON u.id = c.student_id
    WHERE c.id = ? OR c.complaint_id = ?`).get(id, id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  if (req.user.role === 'student' && c.student_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only view your own complaints' });
  }
  const comments = db.prepare(`SELECT cm.*, u.name AS teacher_name FROM comments cm
    JOIN users u ON u.id = cm.teacher_id WHERE cm.complaint_id = ? ORDER BY cm.created_at ASC`).all(c.id);
  res.json({ ...c, comments });
});

// Teacher: update status
router.patch('/:id/status', auth, requireRole('teacher'), (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const c = db.prepare('SELECT * FROM complaints WHERE id = ? OR complaint_id = ?').get(req.params.id, req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  db.prepare("UPDATE complaints SET status = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(status, c.id);
  db.prepare('INSERT INTO notifications (user_id,complaint_id,message) VALUES (?,?,?)')
    .run(c.student_id, c.id, `Your complaint ${c.complaint_id} status changed to ${status}`);
  res.json(db.prepare('SELECT * FROM complaints WHERE id = ?').get(c.id));
});

// Teacher: add comment
router.post('/:id/comments', auth, requireRole('teacher'), (req, res) => {
  const { comment } = req.body || {};
  if (!comment || !comment.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
  const c = db.prepare('SELECT * FROM complaints WHERE id = ? OR complaint_id = ?').get(req.params.id, req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  const info = db.prepare('INSERT INTO comments (complaint_id,teacher_id,comment) VALUES (?,?,?)')
    .run(c.id, req.user.id, comment.trim());
  db.prepare("UPDATE complaints SET updated_at = datetime('now','localtime') WHERE id = ?").run(c.id);
  const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
  db.prepare('INSERT INTO notifications (user_id,complaint_id,message) VALUES (?,?,?)')
    .run(c.student_id, c.id, `${teacher.name} commented on your complaint ${c.complaint_id}`);
  const created = db.prepare(`SELECT cm.*, u.name AS teacher_name FROM comments cm JOIN users u ON u.id = cm.teacher_id WHERE cm.id = ?`).get(info.lastInsertRowid);
  res.status(201).json(created);
});

module.exports = router;
