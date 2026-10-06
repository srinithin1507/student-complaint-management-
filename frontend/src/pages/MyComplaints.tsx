import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { studentNav } from './StudentDashboard';
import api from '../api';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });

  useEffect(() => {
    const params: any = {};
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    api.get('/complaints', { params }).then((r) => setComplaints(r.data)).catch(() => {});
  }, [filters]);

  return (
    <Layout title="My Complaints" items={studentNav}>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Statuses</option>
            {['Pending', 'Under Review', 'Resolved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Categories</option>
            {['Academics', 'Infrastructure', 'Facilities', 'Hostel', 'Transport', 'Administration', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Priorities</option>
            {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        {complaints.length === 0 ? (
          <p className="text-slate-400 text-sm py-10 text-center">No complaints found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b">
                  <th className="pb-2">Complaint ID</th><th>Title</th><th>Category</th><th>Date</th><th>Priority</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                    <td className="py-2.5 font-mono text-xs">{c.complaint_id}</td>
                    <td><Link to={`/student/complaints/${c.complaint_id}`} className="text-sky-700 hover:underline font-medium">{c.title}</Link></td>
                    <td className="text-slate-600">{c.category}</td>
                    <td className="text-slate-500 whitespace-nowrap">{c.created_at?.slice(0, 10)}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
