import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import Tabs from '../common/Tabs';
import Avatar from '../common/Avatar';
import BufferAnimation from '../common/BufferAnimation';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatDate } from '../../utils/dateHelpers';
import { Eye, EyeOff, Plus, X, Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PayrollView from '../payroll/PayrollView';
import PayrollEditForm from '../payroll/PayrollEditForm';

function FieldRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : ''}`} style={{ color: value ? 'var(--ink-primary)' : 'var(--ink-muted)', fontFamily: mono ? 'IBM Plex Mono, monospace' : undefined }}>
        {value || '—'}
      </span>
    </div>
  );
}

export default function ProfileView({ employeeId, readOnly = false }) {
  const { user, isAdmin } = useAuth();
  const effectiveId = employeeId || user?.employeeId || user?.id;
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [form, setForm] = useState({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employee', effectiveId],
    queryFn: () => employeeService.getById(effectiveId).then((r) => r.data),
    enabled: !!effectiveId,
  });

  const mutation = useMutation({
    mutationFn: (updated) => employeeService.update(effectiveId, updated),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee', effectiveId]);
      setEditMode(false);
      toast.success('Profile updated.');
    },
    onError: () => toast.error('Could not save changes. Try again.'),
  });

  const emp = data?.employee || data;

  if (isLoading) return <BufferAnimation variant="walking-doc" size="md" caption="Loading profile…" />;
  if (isError) return <EmptyState isError onRetry={refetch} />;

  const canEdit = isAdmin || (!readOnly && !employeeId);
  const showSalaryTab = isAdmin;

  const profileTabs = [
    { key: 'profile', label: 'My Profile' },
    { key: 'private', label: 'Private Info' },
    { key: 'bank', label: 'Bank Details' },
    ...(showSalaryTab ? [{ key: 'salary', label: 'Salary Info' }] : []),
  ];

  const handleSave = () => {
    mutation.mutate(form);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Profile header */}
      <div className="card p-6 flex items-center gap-5 flex-wrap">
        <div className="relative">
          <Avatar name={emp?.name} src={emp?.profilePictureUrl} size="xl" />
          {canEdit && !readOnly && (
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
              style={{ borderColor: 'var(--border-hairline)', boxShadow: 'var(--card-shadow)' }}>
              <Pencil size={13} style={{ color: 'var(--ink-muted)' }} />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
            </label>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
            {emp?.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            {emp?.jobTitle || 'Employee'} · {emp?.department || 'General'}
          </p>
          <span className="id-pill mt-2 inline-flex">{emp?.empCode || emp?.loginId || '—'}</span>
        </div>
        {canEdit && !readOnly && (
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setEditMode(false)}>Cancel</Button>
                <Button size="sm" loading={mutation.isPending} onClick={handleSave}>
                  <Save size={14} />Save changes
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => { setEditMode(true); setForm({}); }}>
                <Pencil size={14} />Edit profile
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs tabs={profileTabs} defaultTab="profile">
        {(key) => {
          if (key === 'profile') return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Full Name" value={emp?.name} />
              <FieldRow label="Mobile" value={emp?.phone} />
              <FieldRow label="Work Email" value={emp?.email} />
              <FieldRow label="Department" value={emp?.department} />
              <FieldRow label="Job Position" value={emp?.jobTitle} />
              <FieldRow label="Manager" value={emp?.manager} />
              <FieldRow label="Company" value={emp?.company} />
              <FieldRow label="Location" value={emp?.location} />
              <FieldRow label="Date of Joining" value={formatDate(emp?.dateOfJoining)} />
              <FieldRow label="Employee Code" value={emp?.empCode} mono />
              <div className="col-span-full flex flex-col gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                <h3 className="font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>About</h3>
                <FieldRow label="About me" value={emp?.about} />
                <FieldRow label="What I love about my job" value={emp?.whatILove} />
                <FieldRow label="My interests & hobbies" value={emp?.interests} />
              </div>
              <div className="col-span-full flex flex-col gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>Skills</h3>
                  {canEdit && !readOnly && <button className="flex items-center gap-1 text-xs" style={{ color: 'var(--brand-primary)' }}><Plus size={13} />Add Skill</button>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(emp?.skills || []).map((s) => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#EEF2FF', color: 'var(--brand-primary)' }}>
                      {s}
                      {canEdit && !readOnly && <button aria-label={`Remove ${s}`}><X size={11} /></button>}
                    </span>
                  ))}
                  {!emp?.skills?.length && <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>No skills added yet.</span>}
                </div>
              </div>
            </div>
          );
          if (key === 'private') return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Date of Birth" value={formatDate(emp?.dateOfBirth)} />
              <FieldRow label="Gender" value={emp?.gender} />
              <FieldRow label="Nationality" value={emp?.nationality} />
              <FieldRow label="Marital Status" value={emp?.maritalStatus} />
              <FieldRow label="Residing Address" value={emp?.address} />
              <FieldRow label="Personal Email" value={emp?.personalEmail} />
              <FieldRow label="PAN No" value={emp?.panNo} mono />
              <FieldRow label="UAN No" value={emp?.uanNo} mono />
              <FieldRow label="Emp Code" value={emp?.empCode} mono />
            </div>
          );
          if (key === 'bank') return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Bank Name" value={emp?.bankName} />
              <FieldRow label="IFSC Code" value={emp?.ifscCode} mono />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono" style={{ color: 'var(--ink-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {showAccount ? (emp?.bankAccountNumber || '—') : (emp?.bankAccountNumber ? '••••' + emp.bankAccountNumber.slice(-4) : '—')}
                  </span>
                  {emp?.bankAccountNumber && (
                    <button onClick={() => setShowAccount((v) => !v)} aria-label={showAccount ? 'Hide account number' : 'Show account number'}>
                      {showAccount ? <EyeOff size={15} style={{ color: 'var(--ink-muted)' }} /> : <Eye size={15} style={{ color: 'var(--ink-muted)' }} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
          if (key === 'salary') return isAdmin ? (
            <PayrollEditForm employeeId={effectiveId} />
          ) : (
            <PayrollView employeeId={effectiveId} />
          );
          return null;
        }}
      </Tabs>
    </div>
  );
}
