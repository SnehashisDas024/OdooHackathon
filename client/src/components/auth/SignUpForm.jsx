import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Copy, Check, Info } from 'lucide-react';
import { signUpSchema } from '../../utils/validators';
import { authService } from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordRulesHint from './PasswordRulesHint';
import BufferAnimation from '../common/BufferAnimation';

function WelcomeIllustration() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="60" y="55" width="80" height="50" rx="10" fill="#EEF2FF" stroke="#3454D1" strokeWidth="2"/>
      <rect x="70" y="65" width="60" height="8" rx="3" fill="#3454D1" opacity="0.3"/>
      <rect x="70" y="79" width="40" height="6" rx="3" fill="#3454D1" opacity="0.2"/>
      <rect x="70" y="91" width="50" height="6" rx="3" fill="#3454D1" opacity="0.15"/>
      <circle cx="50" cy="35" r="16" fill="#FF6B4A"/>
      <rect x="40" y="52" width="20" height="28" rx="5" fill="#FF6B4A"/>
      <line x1="40" y1="62" x2="28" y2="75" stroke="#FF4422" strokeWidth="3" strokeLinecap="round"/>
      <line x1="60" y1="62" x2="72" y2="75" stroke="#FF4422" strokeWidth="3" strokeLinecap="round"/>
      {/* Welcome sign */}
      <rect x="90" y="20" width="70" height="28" rx="6" fill="#22C55E"/>
      <text x="125" y="38" fontFamily="Sora, sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="700">Welcome!</text>
    </svg>
  );
}

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pwValue, setPwValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await authService.createEmployee(data);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <BufferAnimation variant="walking-doc" size="lg" caption="Creating employee profile…" />;
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <WelcomeIllustration />
        <div>
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
            Employee added!
          </h3>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            Share these credentials securely with the employee.
          </p>
        </div>

        <div className="w-full rounded-2xl p-5 text-left flex flex-col gap-4"
          style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline)' }}>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ink-muted)' }}>
              Login ID
              <span className="ml-1.5 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--brand-primary)' }}>
                <Info size={11}/> OI + Initials + Year + Serial
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="id-pill flex-1">{result.loginId}</span>
              <button
                onClick={() => handleCopy(result.loginId)}
                className="p-2 rounded-lg hover:bg-white transition-colors"
                aria-label="Copy Login ID"
              >
                {copied ? <Check size={16} color="var(--status-present)" /> : <Copy size={16} color="var(--ink-muted)" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--ink-muted)' }}>
              Temporary Password
            </label>
            <div className="flex items-center gap-2">
              <span className="id-pill flex-1 text-[--accent-coral]">{result.tempPassword}</span>
              <button
                onClick={() => handleCopy(result.tempPassword)}
                className="p-2 rounded-lg hover:bg-white transition-colors"
                aria-label="Copy password"
              >
                <Copy size={16} color="var(--ink-muted)" />
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--status-pending)' }}>
              ⚠ Won't be shown again — share securely with the employee.
            </p>
          </div>
        </div>

        <Button onClick={() => setResult(null)} variant="secondary">Add another employee</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="name" label="Full Name" placeholder="Jane Doe" required error={errors.name?.message} {...register('name')} />
        <Input id="email" label="Work Email" type="email" placeholder="jane@company.com" required error={errors.email?.message} {...register('email')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="phone" label="Phone" placeholder="9876543210" required error={errors.phone?.message} {...register('phone')} />
        <Input id="dateOfJoining" label="Date of Joining" type="date" required error={errors.dateOfJoining?.message} {...register('dateOfJoining')} />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--ink-primary)' }}>
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          {...register('role')}
          className="w-full px-4 py-2.5 rounded-xl text-sm border border-[--border-hairline] focus:outline-none focus:ring-2 focus:ring-[--brand-primary]"
          style={{ color: 'var(--ink-primary)' }}
        >
          <option value="">Select role…</option>
          <option value="employee">Employee</option>
          <option value="hr">HR Officer</option>
        </select>
        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
      </div>

      <div>
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Set a strong password"
          required
          error={errors.password?.message}
          {...register('password', { onChange: (e) => setPwValue(e.target.value) })}
        />
        {password && <PasswordRulesHint password={password} />}
      </div>

      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" className="w-full">
        <UserPlus size={16} />
        Add Employee
      </Button>
    </form>
  );
}
