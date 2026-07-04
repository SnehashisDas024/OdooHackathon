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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold md:hidden"
          style={{ background: 'var(--brand-primary)' }}>H</div>
        <span className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--ink-muted)' }}>
          {user?.company || 'Odoo India'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Check in/out systray */}
        {checkLoading ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border-hairline)' }}>
            <BufferAnimation variant="clock-spin" size="sm" caption="" />
          </div>
        ) : checkInData?.checkIn && !checkInData?.checkOut ? (
          <button
            onClick={handleCheckOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all hover:bg-[--bg-canvas]"
            style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
          >
            <CheckCircle size={16} color="var(--status-present)" />
            <span className="font-mono text-xs">{elapsed}</span>
            <span>Check Out</span>
          </button>
        ) : checkInData?.checkOut ? (
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border bg-[--bg-canvas]" style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-muted)' }}>
             <CheckCircle size={16} />
             <span>Checked Out</span>
          </div>
        ) : (
          <button
            onClick={handleCheckIn}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: 'var(--status-present)' }}
          >
            <Clock size={16} />
            Check In
          </button>
        )}

        {/* Avatar dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[--bg-canvas] transition-all"
            aria-expanded={dropOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <Avatar name={user?.name} src={user?.profilePictureUrl} size="sm" />
            <ChevronDown size={14} style={{ color: 'var(--ink-muted)' }} />
          </button>

          {dropOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-lg py-2 z-50"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}
              role="menu"
            >
              <button
                onClick={() => { navigate('/profile'); setDropOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-[--bg-canvas] transition-all"
                style={{ color: 'var(--ink-primary)' }}
                role="menuitem"
              >
                <User size={15} /> My Profile
              </button>
              <hr style={{ borderColor: 'var(--border-hairline)', margin: '4px 0' }} />
              <button
                onClick={() => { signOut(); navigate('/sign-in'); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-red-50 transition-all"
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
