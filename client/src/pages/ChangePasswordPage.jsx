import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { changePasswordSchema } from '../utils/validators';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordRulesHint from '../components/auth/PasswordRulesHint';
import BufferAnimation from '../components/common/BufferAnimation';

function KeyIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="42" r="22" fill="#EEF2FF" stroke="#3454D1" strokeWidth="2.5"/>
      <circle cx="40" cy="42" r="12" fill="white" stroke="#3454D1" strokeWidth="1.5"/>
      <path d="M57 55 L90 88" stroke="#3454D1" strokeWidth="5" strokeLinecap="round"/>
      <line x1="78" y1="76" x2="85" y2="69" stroke="#FF6B4A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="86" y1="82" x2="93" y2="75" stroke="#FF6B4A" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function ChangePasswordPage() {
  const { refetchUser } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const password = watch('newPassword', '');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await authService.changePassword({ newPassword: data.newPassword });
      await refetchUser();
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Password change failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10" style={{ border: '1px solid var(--border-hairline)' }}>
      {done ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <BufferAnimation variant="walking-doc" size="md" caption="Password changed! Taking you to your dashboard…" />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <KeyIllustration />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
              Set a new password
            </h1>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              Your admin assigned a temporary password. Set a strong new one to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div>
              <Input id="newPassword" label="New Password" type="password" placeholder="Choose a strong password" required error={errors.newPassword?.message || serverError} {...register('newPassword')} />
              {password && <PasswordRulesHint password={password} />}
            </div>
            <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter new password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" loading={loading} className="w-full">Save new password</Button>
          </form>
        </>
      )}
    </div>
  );
}
