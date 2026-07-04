import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import BufferAnimation from '../common/BufferAnimation';
import { attendanceService } from '../../services/attendanceService';
import { formatTime } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [elapsed, setElapsed] = useState('');
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (!dropRef.current?.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load today's check-in status on mount
  useEffect(() => {
    if (isAdmin) return;
    let active = true;
    async function fetchStatus() {
      try {
        const res = await attendanceService.getTodayStatus();
        const record = res?.record || res?.data?.record || res?.data?.data?.record;
        if (active && record) {
          setCheckInData(record);
        }
      } catch (err) {
        console.error('Failed to fetch today status:', err);
      }
    }
    fetchStatus();
    return () => { active = false; };
  }, [isAdmin]);

  // Elapsed timer
  useEffect(() => {
    if (!checkInData?.checkIn || checkInData.checkOut) return;
    const id = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(checkInData.checkIn).getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(id);
  }, [checkInData]);

  const handleCheckIn = async () => {
    setCheckLoading(true);
    try {
      const res = await attendanceService.checkIn();
      const record = res?.record || res?.data?.record || res?.data?.data?.record || res;
      setCheckInData(record);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked in! Have a great day.');
      queryClient.invalidateQueries(['attendance']);
    } catch {
      toast.error('Could not check in. Try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckLoading(true);
    try {
      const res = await attendanceService.checkOut();
      const record = res?.record || res?.data?.record || res?.data?.data?.record || res;
      setCheckInData(record);
      setElapsed('');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked out. See you tomorrow!');
      queryClient.invalidateQueries(['attendance']);
    } catch {
      toast.error('Could not check out. Try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <header className="top-header justify-between px-6 gap-4">
      {/* Company */}
      <div className="flex items-center gap-3">
        <div className="logo-mark w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium md:hidden">H</div>
        <span className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--ink-muted)' }}>
          {user?.company || 'Odoo India'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Check in/out systray */}
        {checkLoading ? (
          <div className="soft-action flex items-center gap-2 px-3 py-1.5 rounded-xl">
            <BufferAnimation variant="clock-spin" size="sm" caption="" />
          </div>
        ) : checkInData?.checkIn && !checkInData?.checkOut ? (
          <button
            onClick={handleCheckOut}
            className="soft-action check-out-action flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
          >
            <CheckCircle size={16} />
            <span className="font-mono text-xs">{elapsed}</span>
            <span>Check Out</span>
          </button>
        ) : checkInData?.checkOut ? (
          <div className="checked-out-pill flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl">
             <CheckCircle size={16} />
             <span>Checked Out</span>
          </div>
        ) : (
          <button
            onClick={handleCheckIn}
            className="soft-action check-in-action flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
          >
            <Clock size={16} />
            Check In
          </button>
        )}

        {/* Avatar dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="soft-action flex items-center gap-2 rounded-xl p-1.5 transition-all"
            aria-expanded={dropOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <Avatar name={user?.name} src={user?.profilePictureUrl} size="sm" />
            <ChevronDown size={14} style={{ color: 'var(--ink-muted)' }} />
          </button>

          {dropOpen && (
            <div
              className="neumorphic-convex absolute right-0 top-full mt-2 w-44 rounded-2xl py-2 z-50"
              role="menu"
            >
              <button
                onClick={() => { navigate('/profile'); setDropOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-all"
                style={{ color: 'var(--ink-primary)' }}
                role="menuitem"
              >
                <User size={15} /> My Profile
              </button>
              <hr className="divider" style={{ margin: '4px 0' }} />
              <button
                onClick={() => { signOut(); navigate('/sign-in'); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-all"
                style={{ color: 'var(--status-danger)' }}
                role="menuitem"
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
