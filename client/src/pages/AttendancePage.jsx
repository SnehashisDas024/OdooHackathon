import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { format, isFuture } from 'date-fns';
import { formatTime, getMonthDays, isWeekend, getStatusForDay, formatCurrency } from '../utils/dateHelpers';
import BufferAnimation from '../components/common/BufferAnimation';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import clsx from 'clsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendancePage() {
  const { isAdmin } = useAuth();
  const today = new Date();
  const monthDays = getMonthDays(today);

  // Employee own attendance
  const { data: ownData, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance', 'me', format(today, 'yyyy-MM')],
    queryFn: () => attendanceService.getOwn({ month: format(today, 'yyyy-MM') }).then((r) => r.data),
    enabled: !isAdmin,
  });

  // Admin: today's all-employee attendance
  const { data: allData, isLoading: allLoading, isError: allError, refetch: allRefetch } = useQuery({
    queryKey: ['attendance', 'all', format(today, 'yyyy-MM-dd')],
    queryFn: () => attendanceService.getAll({ date: format(today, 'yyyy-MM-dd') }).then((r) => r.data),
    enabled: isAdmin,
  });

  const records = ownData?.records || [];

  if (isAdmin) {
    const allRecords = allData?.records || [];
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Attendance</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            Real-time status of all employees — {format(today, 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        {allLoading && <BufferAnimation variant="clock-spin" size="md" caption="Fetching today's attendance…" />}
        {allError && <EmptyState isError onRetry={allRefetch} />}
        {!allLoading && !allError && allRecords.length === 0 && (
          <EmptyState variant="empty" title="No attendance data yet" description="Check back once employees start checking in." />
        )}
        {!allLoading && !allError && allRecords.length > 0 && (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-hairline)' }}>
                  {['Employee', 'Status', 'Check In', 'Check Out', 'Work Hours', 'Extra Hours'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRecords.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-[--bg-canvas] transition-colors" style={{ borderColor: 'var(--border-hairline)' }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--ink-primary)' }}>{r.employeeName}</td>
                    <td className="px-5 py-3"><Badge status={r.status} /></td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--ink-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{r.checkIn ? formatTime(r.checkIn) : '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--ink-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{r.checkOut ? formatTime(r.checkOut) : '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-primary)' }}>{r.workHours ? `${r.workHours}h` : '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: r.extraHours > 0 ? 'var(--status-present)' : 'var(--ink-muted)' }}>{r.extraHours ? `+${r.extraHours}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Employee view
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>My Attendance</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
          {format(today, 'MMMM yyyy')} — day-wise view
        </p>
      </div>

      {isLoading && <BufferAnimation variant="clock-spin" size="md" caption="Fetching your attendance…" />}
      {isError && <EmptyState isError onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-hairline)' }}>
                {['Date', 'Day', 'Status', 'Check In', 'Check Out', 'Work Hrs', 'Extra Hrs', 'Break'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--ink-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthDays.map((day) => {
                const rec = getStatusForDay(records, day);
                const future = isFuture(day) && format(day, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
                const weekend = isWeekend(day);

                return (
                  <tr
                    key={day.toISOString()}
                    className={clsx(
                      'border-b last:border-0 transition-colors',
                      weekend || future ? 'opacity-40' : 'hover:bg-[--bg-canvas]'
                    )}
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-primary)' }}>
                      {format(day, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {format(day, 'EEE')}
                    </td>
                    <td className="px-4 py-3">
                      {!future && !weekend && rec ? <Badge status={rec.status} /> : <span style={{ color: 'var(--ink-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-muted)' }}>
                      {rec?.checkIn ? formatTime(rec.checkIn) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-muted)' }}>
                      {rec?.checkOut ? formatTime(rec.checkOut) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-primary)' }}>
                      {rec?.workHours ? `${rec.workHours}h` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: rec?.extraHours > 0 ? 'var(--status-present)' : 'var(--ink-muted)' }}>
                      {rec?.extraHours ? `+${rec.extraHours}h` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-muted)' }}>
                      {rec?.breakHours ? `${rec.breakHours}h` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
