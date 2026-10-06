import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, User, Bell, CheckCheck } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../api';

export const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/student/submit', label: 'Submit Complaint', icon: <PlusCircle size={18} /> },
  { to: '/student/complaints', label: 'My Complaints', icon: <List size={18} /> },
  { to: '/student/profile', label: 'Profile', icon: <User size={18} /> },
];

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.get('/complaints').then((r) => setComplaints(r.data)).catch(() => {});
    api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {});
  }, []);

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    underReview: complaints.filter((c) => c.status === 'Under Review').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
  };
  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: 1 })));
  };

  return (
    <Layout title="Student Dashboard" items={studentNav}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Complaints', value: counts.total, color: 'text-navy' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600' },
          { label: 'Under Review', value: counts.underReview, color: 'text-blue-600' },
          { label: 'Resolved', value: counts.resolved, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy">Recent Complaints</h2>
            <Link to="/student/complaints" className="text-sky-600 text-sm font-medium">View all</Link>
          </div>
          {complaints.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No complaints yet. <Link to="/student/submit" className="text-sky-600">Submit your first one</Link>.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b">
                    <th className="pb-2">ID</th><th>Title</th><th>Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                      <td className="py-2.5 font-mono text-xs">{c.complaint_id}</td>
                      <td className="max-w-[180px] truncate"><Link className="text-sky-700 hover:underline" to={`/student/complaints/${c.complaint_id}`}>{c.title}</Link></td>
                      <td className="text-slate-500 whitespace-nowrap">{c.created_at?.slice(0, 10)}</td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy flex items-center gap-2"><Bell size={16} /> Notifications</h2>
            <button onClick={markAll} className="text-xs text-sky-600 flex items-center gap-1"><CheckCheck size={14} /> Mark all read</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No notifications</p>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} onClick={() => markRead(n.id)} className={`p-3 rounded-lg text-sm cursor-pointer transition ${n.is_read ? 'bg-slate-50 text-slate-500' : 'bg-sky-50 text-navy font-medium'}`}>
                  {n.message}
                  <div className="text-[11px] text-slate-400 mt-1">{n.created_at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link to="/student/submit" className="inline-block mt-6 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-xl shadow transition transform hover:-translate-y-0.5">
        + Submit New Complaint
      </Link>
    </Layout>
  );
}
