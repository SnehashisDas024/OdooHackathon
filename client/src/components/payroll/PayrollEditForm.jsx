import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../../services/payrollService';
import { calculateSalaryComponents } from '../../utils/constants';
import { formatCurrency } from '../../utils/dateHelpers';
import BufferAnimation from '../common/BufferAnimation';
import Button from '../common/Button';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function CalcRow({ label, value, desc, isDeduction }) {
  return (
    <div className="salary-row">
      <div>
        <p className="text-sm font-medium" style={{ color: isDeduction ? 'var(--status-danger)' : 'var(--ink-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{desc}</p>
      </div>
      <span className="font-mono text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace', color: isDeduction ? 'var(--status-danger)' : 'var(--ink-primary)' }}>
        {isDeduction ? '−' : ''}{formatCurrency(value)}
      </span>
    </div>
  );
}

export default function PayrollEditForm({ employeeId }) {
  const queryClient = useQueryClient();
  const [wage, setWage] = useState('');
  const [components, setComponents] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', employeeId],
    queryFn: () => payrollService.getByEmployee(employeeId).then((r) => r.data),
    enabled: !!employeeId,
    onSuccess: (d) => {
      const w = d?.payroll?.monthlyWage || d?.monthlyWage || '';
      setWage(String(w));
      setComponents(calculateSalaryComponents(w));
    },
  });

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (wage) setComponents(calculateSalaryComponents(parseFloat(wage)));
    }, 200);
    return () => clearTimeout(debounce);
  }, [wage]);

  const mutation = useMutation({
    mutationFn: () => payrollService.update(employeeId, { monthlyWage: parseFloat(wage) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['payroll', employeeId]);
      toast.success('Salary structure updated.');
    },
    onError: () => toast.error('Could not update payroll. Try again.'),
  });

  if (isLoading) return <BufferAnimation variant="coin-stack" caption="Loading payroll…" />;

  const total = (components.basic || 0) + (components.hra || 0) + (components.standardAllowance || 0) +
    (components.performanceBonus || 0) + (components.lta || 0) + (components.fixedAllowance || 0);
  const balanced = Math.abs(total - parseFloat(wage || 0)) < 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Wage input */}
      <div className="card p-5">
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--ink-primary)' }}>
          Monthly Wage (₹)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: 'var(--ink-muted)' }}>₹</span>
          <input
            type="number"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            placeholder="50000"
            className="flex-1 text-2xl font-bold font-mono border-0 outline-none bg-transparent"
            style={{ color: 'var(--ink-primary)', fontFamily: 'IBM Plex Mono, monospace' }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
          All components recalculate automatically as you type.
        </p>
      </div>

      {/* Components */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>Auto-Calculated Components</h3>
        <CalcRow label="Basic Salary" value={components.basic} desc="50% of Monthly Wage" />
        <CalcRow label="House Rent Allowance" value={components.hra} desc="50% of Basic Salary" />
        <CalcRow label="Standard Allowance" value={components.standardAllowance} desc="₹4,167 (fixed)" />
        <CalcRow label="Performance Bonus" value={components.performanceBonus} desc="8.33% of Basic Salary" />
        <CalcRow label="Leave Travel Allowance" value={components.lta} desc="8.333% of Basic Salary" />
        <CalcRow label="Fixed Allowance" value={components.fixedAllowance} desc="Wage − sum of all components" />
        <CalcRow label="PF Contribution" value={components.pfContribution} desc="12% of Basic Salary" isDeduction />
        <CalcRow label="Professional Tax" value={components.professionalTax} desc="₹200 (fixed)" isDeduction />

        {/* Balance check */}
        {wage && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: balanced ? '#DCFCE7' : '#FEE2E2' }}>
            <CheckCircle size={16} style={{ color: balanced ? 'var(--status-present)' : 'var(--status-danger)' }} />
            <span className="text-sm font-medium" style={{ color: balanced ? '#15803D' : '#991B1B' }}>
              {balanced ? '✓ Components balance to Monthly Wage' : '⚠ Components do not balance to wage'}
            </span>
          </div>
        )}
      </div>

      <Button onClick={() => mutation.mutate()} loading={mutation.isPending} className="w-full">
        Save Salary Structure
      </Button>
    </div>
  );
}
