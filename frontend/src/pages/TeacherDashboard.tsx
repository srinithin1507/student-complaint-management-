import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, List, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../api';

export const teacherNav = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/teacher/complaints', label: 'All Complaints', icon: <List size={18} /> },
  { to: '/teacher/profile', label: 'Profile', icon: <User size={18} /> },
];

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    api.get('/complaints/stats/summary').then((r) => setStats(r.data)).catch(() => {});
    api.get('/complaints').then((r) => setComplaints(r.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total Complaints', value: stats.total, icon: <FileText size={20} />, color: 'text-navy bg-slate-100' },
    { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'text-amber-700 bg-amber-100' },
    { label: 'Under Review', value: stats.underReview, icon: <AlertCircle size={20} />, color: 'text-blue-700 bg-blue-100' },
    { label: 'Resolved', value: stats.resolved, icon: <CheckCircle size={20} />, color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Rejected', value: stats.rejected, icon: <XCircle size={20} />, color: 'text-red-700 bg-red-100' },
  ] : [];

  return (
    <Layout title="Teacher Dashboard" items={teacherNav}>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div className={`inline-flex p-2 rounded-lg ${c.color}`}>{c.icon}</div>
            <div className="text-3xl font-bold text-navy mt-3">{c.value}</div>
            <div className="text-sm text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy">Latest Complaints</h2>
          <Link to="/teacher/complaints" className="text-sky-600 text-sm font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b">
                <th className="pb-2">ID</th><th>Student</th><th>Title</th><th>Category</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                  <td className="py-2.5 font-mono text-xs">{c.complaint_id}</td>
                  <td>{c.student_name}</td>
                  <td><Link to={`/teacher/complaints/${c.complaint_id}`} className="text-sky-700 hover:underline">{c.title}</Link></td>
                  <td className="text-slate-600">{c.category}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
