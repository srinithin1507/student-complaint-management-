import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export default function Layout({ title, items, children }: { title: string; items: NavItem[]; children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="font-bold text-lg leading-tight block">🎓 Campus<span className="text-sky-400">Helpdesk</span></Link>
          <p className="text-xs text-slate-400 mt-1">Complaint Management</p>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              {it.icon} {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/10">
          <div className="text-sm font-semibold">{user?.name}</div>
          <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold text-navy">{title}</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        <main className="p-4 md:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
