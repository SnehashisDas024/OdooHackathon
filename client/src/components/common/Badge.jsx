import clsx from 'clsx';

const map = {
  present: 'badge--present',
  approved: 'badge--approved',
  absent: 'badge--absent',
  pending: 'badge--pending',
  rejected: 'badge--rejected',
  leave: 'badge--leave',
  halfday: 'badge--pending',
};

export default function Badge({ status, label, className }) {
  return (
    <span className={clsx('badge', map[status?.toLowerCase()] || 'badge--absent', className)}>
      {label || status}
    </span>
  );
}
