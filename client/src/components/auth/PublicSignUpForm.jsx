import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Copy, Check, ChevronRight, ChevronLeft, Building, User, CreditCard } from 'lucide-react';
import { authService } from '../../services/authService';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordRulesHint from './PasswordRulesHint';
import BufferAnimation from '../common/BufferAnimation';
import toast from 'react-hot-toast';

// Validate password strength
const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&#]/, 'Password must contain at least one special character');

// Complete registration schema
const registrationSchema = z
  .object({
    // Step 1: Credentials
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid work email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    password: passwordRules,
    confirmPassword: z.string(),
    
    // Step 2: Job Details
    dateOfJoining: z.string().min(1, 'Date of joining is required'),
    department: z.string().optional(),
    jobPosition: z.string().optional(),
    location: z.string().optional(),
    company: z.string().optional(),

    // Step 3: Personal Information
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    nationality: z.string().optional(),
    maritalStatus: z.string().optional(),
    personalEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
    residingAddress: z.string().optional(),

    // Step 4: Bank Details & Tax Identifiers
    panNo: z.string().optional(),
    uanNo: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const STEPS = [
  { id: 1, name: 'Account', icon: User },
  { id: 2, name: 'Job Details', icon: Building },
  { id: 3, name: 'Personal', icon: User },
  { id: 4, name: 'Finance & Bank', icon: CreditCard },
];

function WelcomeIllustration() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="mx-auto mb-4">
      <rect x="60" y="55" width="80" height="50" rx="10" fill="#EEF2FF" stroke="#3454D1" strokeWidth="2"/>
      <rect x="70" y="65" width="60" height="8" rx="3" fill="#3454D1" opacity="0.3"/>
      <rect x="70" y="79" width="40" height="6" rx="3" fill="#3454D1" opacity="0.2"/>
      <rect x="70" y="91" width="50" height="6" rx="3" fill="#3454D1" opacity="0.15"/>
      <circle cx="50" cy="35" r="16" fill="#FF6B4A"/>
      <rect x="40" y="52" width="20" height="28" rx="5" fill="#FF6B4A"/>
      <line x1="40" y1="62" x2="28" y2="75" stroke="#FF4422" strokeWidth="3" strokeLinecap="round"/>
      <line x1="60" y1="62" x2="72" y2="75" stroke="#FF4422" strokeWidth="3" strokeLinecap="round"/>
      <rect x="90" y="20" width="70" height="28" rx="6" fill="#22C55E"/>
      <text x="125" y="38" fontFamily="Sora, sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="700">Success!</text>
    </svg>
  );
}

export default function PublicSignUpForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pwValue, setPwValue] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      company: 'Odoo India Pvt. Ltd.',
      location: 'Gandhinagar, Gujarat',
    }
  });

  const password = watch('password', '');

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['dateOfJoining', 'department', 'jobPosition', 'location', 'company'];
    } else if (step === 3) {
      fieldsToValidate = ['dateOfBirth', 'gender', 'nationality', 'maritalStatus', 'personalEmail', 'residingAddress'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.signUp({ ...data, role: 'EMPLOYEE' });
      const body = res.data || res;
      const inner = body.data || body;
      setResult(inner);
      toast.success('Registration successful!');
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to complete registration.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Login ID: ${result.loginId}\nTemporary Password: ${password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <WelcomeIllustration />
        <h2 className="text-xl font-bold mt-2" style={{ color: 'var(--ink-primary)' }}>Onboarding Complete!</h2>
        <p className="text-sm max-w-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
          Your employee profile has been registered in the system. Use the credentials below to log in.
        </p>

        <div className="w-full max-w-md bg-[--bg-canvas] rounded-2xl p-6 mt-6 border text-left" style={{ borderColor: 'var(--border-hairline)' }}>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--ink-muted)' }}>Login ID</span>
            <div className="text-sm font-mono font-bold select-all bg-white px-3 py-2 rounded-lg border flex items-center justify-between" style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}>
              {result.loginId}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--ink-muted)' }}>Temporary Password</span>
            <div className="text-sm font-mono font-bold select-all bg-white px-3 py-2 rounded-lg border flex items-center justify-between" style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}>
              {password}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full max-w-md mt-6">
          <Button type="button" variant="secondary" onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2">
            {copied ? <Check size={16} color="var(--status-present)" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Credentials'}
          </Button>
          <a href="/sign-in" className="flex-1">
            <Button variant="primary" className="w-full">Go to Sign In</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[--border-hairline] -translate-y-1/2 z-0" />
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isCompleted = idx + 1 < step;
          const isActive = idx + 1 === step;
          return (
            <div key={s.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[--brand-primary] border-[--brand-primary] text-white'
                    : isActive
                    ? 'bg-white border-[--brand-primary] text-[--brand-primary]'
                    : 'bg-white border-[--border-hairline] text-[--ink-muted]'
                }`}
              >
                {isCompleted ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`text-[10px] md:text-xs font-semibold mt-2 ${isActive ? 'text-[--brand-primary]' : 'text-[--ink-muted]'}`}>
                {s.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Contents */}
      {step === 1 && (
        <div className="space-y-4">
          <Input label="Full Name" required {...register('name')} error={errors.name?.message} placeholder="e.g. Priya Patel" />
          <Input label="Work Email" required {...register('email')} error={errors.email?.message} placeholder="e.g. priya.patel@hrms.com" />
          <Input label="Phone Number" required {...register('phone')} error={errors.phone?.message} placeholder="10-digit mobile number" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              {...register('password', { onChange: (e) => setPwValue(e.target.value) })}
              error={errors.password?.message}
              placeholder="Min 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Retype password"
            />
          </div>
          <PasswordRulesHint password={pwValue || password} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Input label="Date of Joining" type="date" required {...register('dateOfJoining')} error={errors.dateOfJoining?.message} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Department" {...register('department')} error={errors.department?.message} placeholder="e.g. UI/UX Design" />
            <Input label="Job Position" {...register('jobPosition')} error={errors.jobPosition?.message} placeholder="e.g. Product Designer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Work Location" {...register('location')} error={errors.location?.message} placeholder="e.g. Gandhinagar" />
            <Input label="Company Name" {...register('company')} error={errors.company?.message} placeholder="e.g. Odoo India" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>Gender</label>
              <select
                {...register('gender')}
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 focus:ring-[--brand-primary] focus:border-transparent"
                style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)', height: '46px' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nationality" {...register('nationality')} error={errors.nationality?.message} placeholder="e.g. Indian" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>Marital Status</label>
              <select
                {...register('maritalStatus')}
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 focus:ring-[--brand-primary] focus:border-transparent"
                style={{ borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)', height: '46px' }}
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          <Input label="Personal Email" {...register('personalEmail')} error={errors.personalEmail?.message} placeholder="e.g. personal@email.com" />
          <Input label="Residing Address" {...register('residingAddress')} error={errors.residingAddress?.message} placeholder="Full address" />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="PAN Number" {...register('panNo')} error={errors.panNo?.message} placeholder="10-digit PAN" />
            <Input label="UAN Number" {...register('uanNo')} error={errors.uanNo?.message} placeholder="12-digit UAN" />
          </div>

          <Input label="Bank Name" {...register('bankName')} error={errors.bankName?.message} placeholder="e.g. HDFC Bank" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Account Number" {...register('bankAccountNumber')} error={errors.bankAccountNumber?.message} placeholder="Bank account no." />
            <Input label="IFSC Code" {...register('ifscCode')} error={errors.ifscCode?.message} placeholder="IFSC code" />
          </div>
        </div>
      )}

      {/* Button Controls */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
        {step > 1 ? (
          <Button type="button" variant="secondary" onClick={prevStep} className="flex items-center gap-2">
            <ChevronLeft size={16} /> Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length ? (
          <Button type="button" variant="primary" onClick={nextStep} className="flex items-center gap-2">
            Continue <ChevronRight size={16} />
          </Button>
        ) : (
          <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <BufferAnimation variant="clock-spin" size="sm" caption="" />
            ) : (
              <>Register Profile <UserPlus size={16} /></>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
