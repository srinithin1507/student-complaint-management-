import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { studentNav } from './StudentDashboard';
import { teacherNav } from './TeacherDashboard';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const nav = user?.role === 'teacher' ? teacherNav : studentNav;
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((r) => setForm({ name: r.data.name, email: r.data.email, password: '' })).catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const payload: any = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const r = await api.put('/auth/profile', payload);
      setUser({ ...user!, name: r.data.name, email: r.data.email });
      setForm({ ...form, password: '' });
      setMsg('Profile updated successfully.');
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Update failed');
    }
  };

  return (
    <Layout title="Profile" items={nav}>
      <form onSubmit={save} className="bg-white rounded-xl shadow-sm p-6 max-w-lg animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold mb-4">
          {form.name?.[0]?.toUpperCase() || '?'}
        </div>
        {msg && <div className="mb-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg px-3 py-2">{msg}</div>}
        {err && <div className="mb-3 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{err}</div>}
        <label className="text-sm font-medium text-slate-700">Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 mb-4 border border-slate-300 rounded-lg px-3 py-2" />
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="w-full mt-1 mb-4 border border-slate-300 rounded-lg px-3 py-2" />
        <label className="text-sm font-medium text-slate-700">New Password (leave blank to keep)</label>
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full mt-1 mb-5 border border-slate-300 rounded-lg px-3 py-2" />
        <button className="bg-navy hover:bg-navy-light text-white font-semibold rounded-lg px-6 py-2.5 transition">Save Changes</button>
      </form>
    </Layout>
  );
}
