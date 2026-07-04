import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../utils/validators';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordRulesHint from '../components/auth/PasswordRulesHint';
import Card from '../components/common/Card';
import { Bell, Lock, Building2, BookOpen } from 'lucide-react';
import { calculateSalaryComponents } from '../utils/constants';
import { formatCurrency } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

function ChangePasswordSection() {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });
  const [loading, setLoading] = useState(false);
  const password = watch('newPassword', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.changePassword({ newPassword: data.newPassword });
      toast.success('Password changed successfully.');
      reset();
    } catch {
      toast.error('Could not change password. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
        <Lock size={16} style={{ color: 'var(--brand-primary)' }} />Change Password
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Input id="newPassword" label="New Password" type="password" required error={errors.newPassword?.message} {...register('newPassword')} />
          {password && <PasswordRulesHint password={password} />}
        </div>
        <Input id="confirmPassword" label="Confirm New Password" type="password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" loading={loading} className="w-fit">Save new password</Button>
      </form>
    </Card>
  );
}

function SalaryFormulaCard() {
  const example = calculateSalaryComponents(50000);
  return (
    <Card>
      <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
        <BookOpen size={16} style={{ color: 'var(--brand-primary)' }} />Salary Formula Reference
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--ink-muted)' }}>
        Example with Monthly Wage = <span className="font-mono font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹50,000</span>
      </p>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Basic Salary', formula: '50% of Wage', val: example.basic },
          { label: 'HRA', formula: '50% of Basic', val: example.hra },
          { label: 'Standard Allowance', formula: '₹4,167 (fixed)', val: example.standardAllowance },
          { label: 'Performance Bonus', formula: '8.33% of Basic', val: example.performanceBonus },
          { label: 'LTA', formula: '8.333% of Basic', val: example.lta },
          { label: 'Fixed Allowance', formula: 'Wage − all others', val: example.fixedAllowance },
          { label: 'PF Contribution (deduction)', formula: '12% of Basic', val: example.pfContribution },
          { label: 'Professional Tax (deduction)', formula: '₹200 (fixed)', val: example.professionalTax },
        ].map(({ label, formula, val }) => (
          <div key={label} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-hairline)' }}>
            <div>
              <span style={{ color: 'var(--ink-primary)' }}>{label}</span>
              <span className="text-xs ml-2" style={{ color: 'var(--ink-muted)' }}>{formula}</span>
            </div>
            <span className="font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--brand-primary)' }}>
              {formatCurrency(val)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState({
    leaveUpdates: true,
    attendanceReminders: true,
    payrollNotifications: false,
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>Manage your account preferences.</p>
      </div>

      {/* Company details – admin only */}
      {isAdmin && (
        <Card>
          <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
            <Building2 size={16} style={{ color: 'var(--brand-primary)' }} />Company Details
          </h3>
          <div className="flex flex-col gap-4">
            <Input id="companyName" label="Company Name" placeholder="Odoo India" />
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--ink-primary)' }}>Company Logo</label>
              <input type="file" accept="image/*" className="text-sm" />
            </div>
            <Button className="w-fit">Save company details</Button>
          </div>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
          <Bell size={16} style={{ color: 'var(--brand-primary)' }} />Notification Preferences
        </h3>
        <div className="flex flex-col gap-4">
          {Object.entries(notifications).map(([key, val]) => {
            const labels = {
              leaveUpdates: 'Leave request updates',
              attendanceReminders: 'Daily attendance reminders',
              payrollNotifications: 'Payroll and salary notifications',
            };
            return (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm" style={{ color: 'var(--ink-primary)' }}>{labels[key]}</span>
                <div
                  onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: val ? 'var(--brand-primary)' : 'var(--border-hairline)' }}
                  role="switch"
                  aria-checked={val}
                  tabIndex={0}
                >
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: val ? '24px' : '4px' }} />
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Password */}
      <ChangePasswordSection />

      {/* Salary formula reference – admin only */}
      {isAdmin && <SalaryFormulaCard />}
    </div>
  );
}
