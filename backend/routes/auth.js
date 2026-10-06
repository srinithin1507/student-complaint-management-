const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth, JWT_SECRET } = require('../middleware/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email is required' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashed = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users (name,email,password,role) VALUES (?,?,?,'student')")
    .run(name.trim(), email.trim().toLowerCase(), hashed);
  const user = { id: info.lastInsertRowid, name: name.trim(), email: email.trim().toLowerCase(), role: 'student' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: payload });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id,name,email,role,created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/profile', auth, (req, res) => {
  const { name, email, password } = req.body || {};
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!current) return res.status(404).json({ error: 'User not found' });
  if (name !== undefined && !name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
  if (email !== undefined && !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Valid email required' });
  if (password !== undefined && password && password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const newEmail = (email || current.email).trim().toLowerCase();
  const clash = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(newEmail, req.user.id);
  if (clash) return res.status(409).json({ error: 'Email already in use' });

  const newHash = password && password.length >= 6 ? bcrypt.hashSync(password, 10) : current.password;
  db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?')
    .run((name || current.name).trim(), newEmail, newHash, req.user.id);
  const updated = db.prepare('SELECT id,name,email,role,created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

module.exports = router;
