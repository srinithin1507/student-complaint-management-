import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Clock, MessageSquare } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="font-bold text-xl">🎓 Campus<span className="text-sky-400">Helpdesk</span></div>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/10 transition">Login</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 hover:bg-sky-400 transition">Register</Link>
        </div>
      </nav>
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">Student Complaint<br/>Management System</h1>
        <p className="text-slate-300 mt-5 max-w-2xl mx-auto">A simple, transparent platform for students to raise issues and for faculty to respond — track every complaint from submission to resolution.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold transition transform hover:-translate-y-0.5">Get Started</Link>
          <Link to="/login" className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 font-semibold transition">Sign In</Link>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-16 grid gap-4 md:grid-cols-3">
        {[
          { icon: <GraduationCap />, t: 'Easy for Students', d: 'Submit complaints in seconds with attachments and priority levels.' },
          { icon: <Clock />, t: 'Track Status Live', d: 'Follow your complaint through Pending, Under Review, Resolved or Rejected.' },
          { icon: <MessageSquare />, t: 'Direct Replies', d: 'Read teacher comments and get notified on every update.' },
        ].map((f) => (
          <div key={f.t} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <div className="text-sky-400 mb-3">{f.icon}</div>
            <h3 className="font-semibold">{f.t}</h3>
            <p className="text-sm text-slate-400 mt-1">{f.d}</p>
          </div>
        ))}
      </section>
      <footer className="text-center text-slate-500 text-xs pb-6 flex items-center justify-center gap-1"><ShieldCheck size={12}/> Secure JWT authentication · Passwords hashed with bcrypt</footer>
    </div>
  );
}
