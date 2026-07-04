import PayrollView from '../components/payroll/PayrollView';
import { useAuth } from '../context/AuthContext';

export default function PayrollPage() {
  const { isAdmin } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Payroll</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
          {isAdmin ? 'Manage salary structures for all employees.' : 'Your monthly salary breakdown.'}
        </p>
      </div>
      <PayrollView />
    </div>
  );
}
