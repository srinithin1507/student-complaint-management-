import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import TeacherDashboard from './pages/TeacherDashboard';
import AllComplaints from './pages/AllComplaints';
import TeacherComplaintDetails from './pages/TeacherComplaintDetails';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/submit" element={<ProtectedRoute role="student"><SubmitComplaint /></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute role="student"><MyComplaints /></ProtectedRoute>} />
      <Route path="/student/complaints/:id" element={<ProtectedRoute role="student"><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />

      <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/complaints" element={<ProtectedRoute role="teacher"><AllComplaints /></ProtectedRoute>} />
      <Route path="/teacher/complaints/:id" element={<ProtectedRoute role="teacher"><TeacherComplaintDetails /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
