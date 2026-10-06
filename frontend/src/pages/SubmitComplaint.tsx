import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { studentNav } from './StudentDashboard';
import api from '../api';

const CATEGORIES = ['Academics', 'Infrastructure', 'Facilities', 'Hostel', 'Transport', 'Administration', 'Other'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'Academics', description: '', priority: 'Medium' });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.description.trim()) return setError('Description is required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('priority', form.priority);
      if (file) fd.append('attachment', file);
      const res = await api.post('/complaints', fd);
      alert(`Complaint submitted successfully!\nComplaint ID: ${res.data.complaint_id}`);
      navigate(`/student/complaints/${res.data.complaint_id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Submit Complaint" items={studentNav}>
      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl animate-fade-in">
        {error && <div className="mb-4 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Complaint Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Brief summary of the issue" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 bg-white">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Priority *</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 bg-white">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description *</label>
            <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Describe the issue in detail…" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Attachment (optional image or PDF, max 5MB)</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full mt-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-navy file:text-white" />
          </div>
          <button disabled={loading} className="bg-navy hover:bg-navy-light text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50">
            {loading ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
