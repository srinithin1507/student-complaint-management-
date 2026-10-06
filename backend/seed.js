const db = require('./db');
const bcrypt = require('bcryptjs');

const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (count > 0) {
  console.log('Database already seeded.');
  process.exit(0);
}

const hash = (p) => bcrypt.hashSync(p, 10);

const insertUser = db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)');
const t1 = insertUser.run('Dr. Anita Sharma', 'teacher@college.edu', hash('teacher123'), 'teacher');
const t2 = insertUser.run('Prof. Rajesh Kumar', 'rajesh@college.edu', hash('teacher123'), 'teacher');
const s1 = insertUser.run('Aarav Mehta', 'aarav@college.edu', hash('student123'), 'student');
const s2 = insertUser.run('Priya Nair', 'priya@college.edu', hash('student123'), 'student');

const insertC = db.prepare(`INSERT INTO complaints (complaint_id,student_id,title,category,description,attachment,priority,status,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,datetime('now','localtime',?),datetime('now','localtime',?))`);

insertC.run('CMP-2026-1001', s1.lastInsertRowid, 'Wi-Fi not working in hostel Block B', 'Infrastructure',
  'The Wi-Fi in hostel Block B has been down for three days. We are unable to attend online quizzes.', null, 'High', 'Under Review', '-2 days', '-1 day');
insertC.run('CMP-2026-1002', s1.lastInsertRowid, 'Library closing too early', 'Facilities',
  'The library closes at 6 PM which conflicts with evening lab batches. Please extend hours to 9 PM.', null, 'Medium', 'Pending', '-1 day', '-1 day');
insertC.run('CMP-2026-1003', s2.lastInsertRowid, 'Delay in internal marks publication', 'Academics',
  'Internal marks for Database Systems were supposed to be published last week but are still pending.', null, 'High', 'Resolved', '-5 days', '-3 days');
insertC.run('CMP-2026-1004', s2.lastInsertRowid, 'Cafeteria food quality', 'Facilities',
  'The quality of food in the main cafeteria has degraded significantly over the past month.', null, 'Low', 'Rejected', '-7 days', '-6 days');
insertC.run('CMP-2026-1005', s1.lastInsertRowid, 'Request for new data projectors in Room 204', 'Infrastructure',
  'The projector in Room 204 flickers during lectures and is unusable for presentations.', null, 'Medium', 'Resolved', '-4 days', '-2 days');

const insertComment = db.prepare("INSERT INTO comments (complaint_id,teacher_id,comment,created_at) VALUES (?,?,?,datetime('now','localtime',?))");
insertComment.run(1, t1.lastInsertRowid, 'We have escalated this to the IT department. New routers will be installed Block B soon.', '-1 day');
insertComment.run(3, t2.lastInsertRowid, 'Marks have been re-verified and published on the portal. Please check and confirm.', '-3 days');
insertComment.run(4, t1.lastInsertRowid, 'We looked into this. The menu and vendors remain within quality standards, so this has been reviewed. If issues persist, please submit specific details.', '-6 days');
insertComment.run(5, t2.lastInsertRowid, 'A new projector has been ordered and installed in Room 204. Thank you for reporting.', '-2 days');

const insertN = db.prepare("INSERT INTO notifications (user_id,complaint_id,message,is_read,created_at) VALUES (?,?,?,?,datetime('now','localtime',?))");
insertN.run(s1.lastInsertRowid, 1, 'Dr. Anita Sharma commented on your complaint CMP-2026-1001', 0, '-1 day');
insertN.run(s2.lastInsertRowid, 3, 'Prof. Rajesh Kumar commented on your complaint CMP-2026-1003', 1, '-3 days');
insertN.run(s2.lastInsertRowid, 4, 'Your complaint CMP-2026-1004 status changed to Rejected', 1, '-6 days');
insertN.run(s1.lastInsertRowid, 5, 'Your complaint CMP-2026-1005 status changed to Resolved', 0, '-2 days');

console.log('Seed data inserted. Demo logins:');
console.log('  Teacher: teacher@college.edu / teacher123');
console.log('  Student: aarav@college.edu / student123');
