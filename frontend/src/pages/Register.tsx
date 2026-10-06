import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold text-navy">Student Registration</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">Create your CampusHelpdesk account</p>
        {error && <div className="mb-4 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
        {(['name', 'email', 'password', 'confirm'] as const).map((k) => (
          <div key={k} className="mb-4">
            <label className="text-sm font-medium text-slate-700 capitalize">{k === 'confirm' ? 'Confirm Password' : k}</label>
            <input
              value={form[k]}
              onChange={set(k)}
              type={k === 'password' || k === 'confirm' ? 'password' : k === 'email' ? 'email' : 'text'}
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        ))}
        <button disabled={loading} className="w-full bg-navy hover:bg-navy-light text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50">
          {loading ? 'Creating…' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-sky-600 font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
