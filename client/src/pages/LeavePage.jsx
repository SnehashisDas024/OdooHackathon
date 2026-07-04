import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import BufferAnimation from '../components/common/BufferAnimation';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { differenceInCalendarDays, format } from 'date-fns';
import { PlaneTakeoff, Paperclip, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { LEAVE_TYPES } from '../utils/constants';

// ── Balance Card ──────────────────────────────────────────
function BalanceCard({ label, used, total, color }) {
  const remaining = total != null ? total - used : null;
  const pct = total ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>{label}</span>
        {remaining != null && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: color + '22', color }}>
            {remaining} days left
          </span>
        )}
      </div>
      {total && (
        <div className="h-2 rounded-full" style={{ background: 'var(--border-hairline)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
      <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
        {used} used{total ? ` of ${total} days` : ''}
      </p>
    </div>
  );
}

// ── Apply Form ────────────────────────────────────────────
function ApplyLeaveModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState('paid');
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const days = range.from && range.to
    ? differenceInCalendarDays(range.to, range.from) + 1
    : range.from ? 1 : 0;

  const handleSubmit = async () => {
    if (!range.from) return toast.error('Select at least one day.');
    if (!remarks.trim()) return toast.error('Add a remark.');
    if (type === 'sick' && !attachment) return toast.error('Sick leave requires a medical certificate. Attach a file.');
    setLoading(true);
    try {
      await leaveService.apply({
        type: type.toUpperCase(),
        startDate: format(range.from, 'yyyy-MM-dd'),
        endDate: format(range.to || range.from, 'yyyy-MM-dd'),
        remarks,
        attachment,
      });
      toast.success('Leave request submitted!');
      queryClient.invalidateQueries(['myLeaves']);
      queryClient.invalidateQueries(['leaveBalances']);
      onClose();
    } catch {
      toast.error('Could not submit your request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Apply for Time Off" size="lg">
      {loading ? (
        <BufferAnimation variant="paper-plane" size="md" caption="Submitting your request…" />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Type selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>Time Off Type</label>
            <div className="grid grid-cols-3 gap-2">
              {LEAVE_TYPES.map((lt) => (
                <button key={lt.value} onClick={() => setType(lt.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all text-center border ${type === lt.value ? 'border-[--brand-primary] bg-[--bg-canvas]' : 'border-[--border-hairline] hover:bg-[--bg-canvas]'}`}
                  style={{ color: type === lt.value ? 'var(--brand-primary)' : 'var(--ink-muted)' }}>
                  {lt.label}
                  {lt.days && <span className="block text-xs mt-0.5">{lt.days} days/year</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
              <Calendar size={14} />Select Dates
            </label>
            <div className="rounded-xl p-3 overflow-x-auto" style={{ border: '1px solid var(--border-hairline)' }}>
              <DayPicker mode="range" selected={range} onSelect={setRange} fromDate={new Date()}
                className="!font-inter !text-sm" />
            </div>
            {days > 0 && (
              <p className="text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>
                {days} day{days > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
              placeholder="Briefly describe the reason for your leave…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[--border-hairline] focus:outline-none focus:ring-2 focus:ring-[--brand-primary] resize-none"
              style={{ color: 'var(--ink-primary)' }} />
          </div>

          {/* Attachment (required for sick) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--ink-primary)' }}>
              <Paperclip size={14} />Attachment
              {type === 'sick' && <span className="text-xs text-red-500 ml-1">* Required for Sick Leave</span>}
            </label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="text-sm" />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose}>Discard</Button>
            <Button onClick={handleSubmit}><PlaneTakeoff size={15} />Submit Request</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Main Leave Page Component ─────────────────────────────
export default function LeavePage() {
  const { isAdmin } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);

  const { data: balances } = useQuery({
    queryKey: ['leaveBalances'],
    queryFn: () => leaveService.getBalances().then((r) => r.data.data),
    placeholderData: { paid: { used: 0, total: 24 }, sick: { used: 0, total: 7 }, unpaid: { used: 0 } },
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: isAdmin ? ['allLeaves'] : ['myLeaves'],
    queryFn: () => (isAdmin ? leaveService.getAll() : leaveService.getOwn()).then((r) => r.data?.data || r.data || r),
  });

  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: ({ id, comment }) => leaveService.approve(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(isAdmin ? ['allLeaves'] : ['myLeaves']);
      toast.success('Leave approved.');
    },
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }) => leaveService.reject(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(isAdmin ? ['allLeaves'] : ['myLeaves']);
      toast.success('Leave rejected.');
    },
  });

  const leaves = data?.leaves || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Time Off</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>Manage your leave requests and balances.</p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setApplyOpen(true)}>
            <PlaneTakeoff size={16} />Apply for Leave
          </Button>
        )}
      </div>

      {/* Balance cards */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BalanceCard label="Paid Time Off" used={balances?.paid?.used || 0} total={24} color="var(--brand-primary)" />
          <BalanceCard label="Sick Leave" used={balances?.sick?.used || 0} total={7} color="var(--status-pending)" />
          <BalanceCard label="Unpaid Leave" used={balances?.unpaid?.used || 0} total={null} color="var(--ink-muted)" />
        </div>
      )}

      {/* Requests list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-hairline)' }}>
          <h2 className="font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
            {isAdmin ? 'All Leave Requests' : 'My Requests'}
          </h2>
        </div>
        {isLoading && <BufferAnimation variant="paper-plane" size="md" caption="Fetching leave records…" />}
        {isError && <EmptyState isError onRetry={refetch} />}
        {!isLoading && !isError && leaves.length === 0 && (
          <EmptyState variant="leave" title="No time off booked yet"
            description="Your leave requests will appear here." />
        )}
        {!isLoading && !isError && leaves.length > 0 && (
          <ul className="divide-y" style={{ '--tw-divide-color': 'var(--border-hairline)' }}>
            {leaves.map((l) => (
              <li key={l.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1 min-w-0">
                  {isAdmin && <p className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{l.employeeName}</p>}
                  <p className="text-sm" style={{ color: 'var(--ink-primary)' }}>
                    {l.type === 'paid' ? 'Paid Time Off' : l.type === 'sick' ? 'Sick Leave' : 'Unpaid Leave'}
                    {' · '}
                    <span style={{ color: 'var(--ink-muted)' }}>{l.startDate} → {l.endDate} ({l.daysCount} day{l.daysCount > 1 ? 's' : ''})</span>
                  </p>
                  {l.adminComment && <p className="text-xs italic" style={{ color: 'var(--ink-muted)' }}>"{l.adminComment}"</p>}
                  {l.status === 'approved' && (
                    <p className="text-xs" style={{ color: 'var(--status-leave)' }}>✈️ This shows as On Leave on your dashboard card while active.</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={l.status} />
                  {isAdmin && l.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => rejectMutation.mutate({ id: l.id, comment: '' })}>Reject</Button>
                      <Button size="sm" onClick={() => approveMutation.mutate({ id: l.id, comment: '' })}>Approve</Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ApplyLeaveModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}
