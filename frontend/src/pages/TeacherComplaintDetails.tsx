import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import { teacherNav } from './TeacherDashboard';
import api from '../api';

export default function TeacherComplaintDetails() {
  const { id } = useParams();
  const [c, setC] = useState<any>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => api.get(`/complaints/${id}`).then((r) => { setC(r.data); setStatus(r.data.status); }).catch((e) => setError(e.response?.data?.error || 'Failed to load'));
  useEffect(() => { load(); }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (!comment.trim() && status === c.status) return setError('Write a comment or change the status');
    setSaving(true);
    try {
      if (comment.trim()) await api.post(`/complaints/${id}/comments`, { comment });
      if (status !== c.status) await api.patch(`/complaints/${id}/status`, { status });
      setComment('');
      setMsg('Update saved — the student can now see it.');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Complaint Details" items={teacherNav}>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      {msg && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mb-4 text-sm">{msg}</div>}
      {!c && !error && <p className="text-slate-400">Loading…</p>}
      {c && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{c.complaint_id}</span>
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
            <h2 className="text-xl font-bold text-navy mt-3">{c.title}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div><span className="text-slate-400">Student:</span> {c.student_name}</div>
              <div><span className="text-slate-400">Email:</span> {c.student_email}</div>
              <div><span className="text-slate-400">Category:</span> {c.category}</div>
              <div><span className="text-slate-400">Submitted:</span> {c.created_at}</div>
            </div>
            <p className="text-slate-700 mt-4 whitespace-pre-wrap">{c.description}</p>
            {c.attachment && (
              <div className="mt-4">
                <a href={c.attachment} target="_blank" rel="noreferrer" className="text-sky-600 font-medium hover:underline">📎 View attachment</a>
                {/\.(png|jpe?g|gif|webp)$/i.test(c.attachment) && <img src={c.attachment} alt="attachment" className="mt-2 max-h-64 rounded-lg border" />}
              </div>
            )}

            <h3 className="font-bold text-navy mt-8 mb-3">Comments</h3>
            {c.comments.length === 0 ? (
              <p className="text-slate-400 text-sm">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {c.comments.map((cm: any) => (
                  <div key={cm.id} className="border-l-4 border-sky-400 bg-slate-50 rounded-r-lg p-4">
                    <div className="font-semibold text-navy text-sm">{cm.teacher_name}</div>
                    <p className="text-slate-700 mt-1 text-sm">{cm.comment}</p>
                    <div className="text-xs text-slate-400 mt-2">{cm.created_at}</div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 border-t pt-5">
              <h3 className="font-bold text-navy mb-3">Respond</h3>
              <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment or reply…" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 bg-white">
                  {['Pending', 'Under Review', 'Resolved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
                </select>
                <button disabled={saving} className="bg-navy hover:bg-navy-light text-white font-semibold rounded-lg px-5 py-2 transition disabled:opacity-50">
                  {saving ? 'Saving…' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-navy mb-4">Progress</h3>
            <Timeline status={c.status} hasComments={c.comments.length > 0} />
            <Link to="/teacher/complaints" className="text-sky-600 text-sm font-medium">← Back to all complaints</Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
