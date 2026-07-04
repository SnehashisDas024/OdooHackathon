import { useQuery } from '@tanstack/react-query';
import { payrollService } from '../../services/payrollService';
import { calculateSalaryComponents } from '../../utils/constants';
import { formatCurrency } from '../../utils/dateHelpers';
import BufferAnimation from '../common/BufferAnimation';
import EmptyState from '../common/EmptyState';

function Row({ label, value, desc, isDeduction, isBold }) {
  return (
    <div className={`salary-row ${isBold ? 'font-semibold' : ''}`}>
      <div className="flex flex-col gap-0.5">
        <span className={`text-sm ${isBold ? 'font-semibold' : 'font-medium'}`}
          style={{ color: isDeduction ? 'var(--status-danger)' : 'var(--ink-primary)' }}>
          {label}
        </span>
        {desc && <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{desc}</span>}
      </div>
      <span className="font-mono text-sm" style={{ color: isDeduction ? 'var(--status-danger)' : 'var(--ink-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>
        {isDeduction ? '−' : ''}{formatCurrency(value)}
      </span>
    </div>
  );
}

export default function PayrollView({ employeeId }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payroll', employeeId],
    queryFn: () => (employeeId ? payrollService.getByEmployee(employeeId) : payrollService.getOwn()).then((r) => r.data),
  });

  if (isLoading) return <BufferAnimation variant="coin-stack" size="md" caption="Fetching your payslip…" />;
  if (isError) return <EmptyState isError onRetry={refetch} />;

  const payroll = data?.payroll || data;
  const wage = payroll?.monthlyWage || 0;
  const c = calculateSalaryComponents(wage);

  return (
    <div className="flex flex-col gap-6">
      {/* Monthly wage header */}
      <div className="card p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--ink-muted)' }}>Monthly Wage</p>
          <p className="text-3xl font-bold font-mono" style={{ color: 'var(--ink-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            {formatCurrency(wage)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--ink-muted)' }}>Yearly</p>
          <p className="text-xl font-bold font-mono" style={{ color: 'var(--ink-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            {formatCurrency(wage * 12)}
          </p>
        </div>
      </div>

      {/* Earnings */}
      <div className="card p-5">
        <h3 className="font-semibold text-base mb-4" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>Salary Components</h3>
        <Row label="Basic Salary" value={c.basic} desc="50% of Monthly Wage" />
        <Row label="House Rent Allowance" value={c.hra} desc="50% of Basic Salary" />
        <Row label="Standard Allowance" value={c.standardAllowance} desc="₹4,167 (fixed)" />
        <Row label="Performance Bonus" value={c.performanceBonus} desc="8.33% of Basic Salary" />
        <Row label="Leave Travel Allowance" value={c.lta} desc="8.333% of Basic Salary" />
        <Row label="Fixed Allowance" value={c.fixedAllowance} desc="Wage − all other components" />
        <div className="salary-row" style={{ borderBottom: 'none' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>Gross Salary</span>
          <span className="font-mono text-sm font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-primary)' }}>
            {formatCurrency(c.grossSalary)}
          </span>
        </div>
      </div>

      {/* Deductions */}
      <div className="card p-5">
        <h3 className="font-semibold text-base mb-4" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>Deductions</h3>
        <Row label="PF Contribution" value={c.pfContribution} desc="12% of Basic Salary" isDeduction />
        <Row label="Professional Tax" value={c.professionalTax} desc="₹200 (fixed)" isDeduction />
        <div className="salary-row font-bold" style={{ borderBottom: 'none', borderTop: '2px solid var(--ink-primary)', paddingTop: '14px', marginTop: '4px' }}>
          <span className="text-base font-bold" style={{ color: 'var(--ink-primary)' }}>Net Payable</span>
          <span className="font-mono text-base font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--status-present)' }}>
            {formatCurrency(c.netPayable)}
          </span>
        </div>
      </div>
    </div>
  );
}
