import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Please enter email and password');
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      navigate(u.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold text-navy">Welcome Back</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">Sign in to CampusHelpdesk</p>
        {error && <div className="mb-4 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full mt-1 mb-4 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="you@college.edu" />
        <label className="text-sm font-medium text-slate-700">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full mt-1 mb-6 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="••••••" />
        <button disabled={loading} className="w-full bg-navy hover:bg-navy-light text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-slate-500 mt-4">
          New student? <Link to="/register" className="text-sky-600 font-medium">Create an account</Link>
        </p>
        <div className="mt-4 text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
          Demo accounts:<br/>Teacher: teacher@college.edu / teacher123<br/>Student: aarav@college.edu / student123
        </div>
      </form>
    </div>
  );
}
