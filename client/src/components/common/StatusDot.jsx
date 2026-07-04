import { PlaneTakeoff } from 'lucide-react';
import clsx from 'clsx';

/**
 * StatusDot – 3-state indicator for employee cards
 * present | absent | leave
 */
export default function StatusDot({ status = 'absent', className }) {
  if (status === 'leave') {
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center w-6 h-6 rounded-full',
          className
        )}
        style={{ background: 'var(--status-leave)' }}
        aria-label="On Leave"
        title="On Leave"
      >
        <PlaneTakeoff size={12} color="white" />
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'status-dot',
        status === 'present' ? 'status-dot--present' : 'status-dot--absent',
        className
      )}
      aria-label={status === 'present' ? 'Present' : 'Absent'}
      title={status === 'present' ? 'Present' : 'Absent'}
    />
  );
}
