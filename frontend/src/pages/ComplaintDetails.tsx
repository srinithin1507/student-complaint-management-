import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import { studentNav } from './StudentDashboard';
import api from '../api';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [c, setC] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/complaints/${id}`).then((r) => setC(r.data)).catch((e) => setError(e.response?.data?.error || 'Failed to load'));
  }, [id]);

  return (
    <Layout title="Complaint Details" items={studentNav}>
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}
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
            <div className="text-sm text-slate-500 mt-1">{c.category} · Submitted {c.created_at}</div>
            <p className="text-slate-700 mt-4 whitespace-pre-wrap">{c.description}</p>
            {c.attachment && (
              <div className="mt-4">
                <a href={c.attachment} target="_blank" rel="noreferrer" className="text-sky-600 font-medium hover:underline">📎 View attachment</a>
                {/\.(png|jpe?g|gif|webp)$/i.test(c.attachment) && <img src={c.attachment} alt="attachment" className="mt-2 max-h-64 rounded-lg border" />}
              </div>
            )}

            <h3 className="font-bold text-navy mt-8 mb-3">Teacher Replies</h3>
            {c.comments.length === 0 ? (
              <p className="text-slate-400 text-sm">No replies yet.</p>
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
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-navy mb-4">Progress</h3>
            <Timeline status={c.status} hasComments={c.comments.length > 0} />
            <Link to="/student/complaints" className="text-sky-600 text-sm font-medium">← Back to my complaints</Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
