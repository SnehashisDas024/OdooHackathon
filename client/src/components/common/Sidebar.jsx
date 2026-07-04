import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, PlaneTakeoff, Wallet, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users, adminOnly: true },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/leave', label: 'Time Off', icon: PlaneTakeoff },
  { path: '/payroll', label: 'Payroll', icon: Wallet, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visible = navItems.filter((n) => !n.adminOnly || isAdmin);

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'var(--brand-primary)', fontFamily: 'Sora, sans-serif' }}>
          H
        </div>
        <span className="font-bold text-base" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
          HRMS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Main navigation">
        {visible.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-[--brand-primary] text-white shadow-sm'
                  : 'text-[--ink-muted] hover:bg-[--bg-canvas] hover:text-[--ink-primary]'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user?.name} src={user?.profilePictureUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--ink-primary)' }}>{user?.name || 'User'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-4 py-2 text-sm rounded-xl transition-all w-full text-left hover:bg-red-50"
          style={{ color: 'var(--status-danger)' }}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-card border border-[--border-hairline]"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="sidebar open flex flex-col z-50">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
