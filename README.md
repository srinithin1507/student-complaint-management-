# Student Complaint Management System

A full-stack college helpdesk app where students submit complaints and teachers review, comment, and update statuses.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + lucide-react icons
- **Backend:** Node.js + Express
- **Auth:** JWT (Bearer tokens) + bcryptjs password hashing
- **Database:** SQL database with the full schema below. This environment has no PostgreSQL server installed, so it uses Node.js's built-in SQLite driver (`node:sqlite`) — the schema, queries, and flow are identical to PostgreSQL/MySQL and can be ported by switching the driver. The `users`, `complaints`, `comments`, and `notifications` tables match the spec exactly.

## Demo Accounts
| Role | Email | Password |
|---|---|---|
| Teacher | teacher@college.edu | teacher123 |
| Teacher | rajesh@college.edu | teacher123 |
| Student | aarav@college.edu | student123 |
| Student | priya@college.edu | student123 |

## Run It

Backend (Terminal 1):
```bash
cd backend
npm install        # already done
node server.js     # http://localhost:5000
```

To reset the demo data: `node seed.js` (after deleting `backend/college.db`).

Frontend (Terminal 2):
```bash
cd frontend
npm install        # already done
npm run dev        # http://localhost:5173 (proxy /api -> :5000)
```

## Pages
- `/` Landing, `/login`, `/register`
- `/student/dashboard`, `/student/submit`, `/student/complaints`, `/student/complaints/:id`, `/student/profile`
- `/teacher/dashboard`, `/teacher/complaints`, `/teacher/complaints/:id`, `/teacher/profile`

## API Overview
- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` · `PUT /api/auth/profile`
- `GET /api/complaints` (role-scoped list + filters: status, category, priority, date, search) · `POST /api/complaints` (multipart, student only)
- `GET /api/complaints/:id` · `PATCH /api/complaints/:id/status` (teacher) · `POST /api/complaints/:id/comments` (teacher)
- `GET /api/complaints/stats/summary` (teacher)
- `GET /api/notifications` · `GET /api/notifications/unread-count` · `PATCH /api/notifications/:id/read` · `PATCH /api/notifications/read-all`

## Security
- Passwords bcrypt-hashed; JWT required on all protected routes.
- Students only see their own complaints (enforced on list, detail, and notification queries).
- Students cannot change status or add comments (teacher role guard).
- Teacher replies and status changes write notifications for the student, visible on the student dashboard.

## Database Schema
```sql
users (id, name, email UNIQUE, password, role CHECK(student|teacher), created_at)
complaints (id, complaint_id UNIQUE, student_id FK, title, category, description,
            attachment, priority CHECK(Low|Medium|High),
            status CHECK(Pending|Under Review|Resolved|Rejected), created_at, updated_at)
comments (id, complaint_id FK, teacher_id FK, comment, created_at)
notifications (id, user_id FK, complaint_id FK, message, is_read, created_at)
```
