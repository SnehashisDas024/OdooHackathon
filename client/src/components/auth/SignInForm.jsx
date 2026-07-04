import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { signInSchema } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import BufferAnimation from '../common/BufferAnimation';

export default function SignInForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      // signIn returns { user, mustChangePassword } from backend envelope
      const result = await signIn(data);
      if (result?.mustChangePassword) {
        navigate('/change-password');
        return;
      }
      setTransitioning(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      // Backend returns { success: false, error: { message } }
      const msg = err?.response?.data?.error?.message
        || err?.response?.data?.message
        || "That Login ID or password doesn't match our records.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (transitioning) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <BufferAnimation variant="walking-doc" size="lg" caption="Getting your dashboard ready…" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Input
        id="loginId"
        label="Login ID or Email"
        placeholder="OIJODO20220001 or jane@company.com"
        required
        error={errors.loginId?.message}
        {...register('loginId')}
      />

      <div className="relative">
        <Input
          id="password"
          label="Password"
          type={showPass ? 'text' : 'password'}
          placeholder="Enter your password"
          required
          error={errors.password?.message || serverError}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          className="absolute right-3 top-9 text-[--ink-muted] hover:text-[--ink-primary] transition-colors"
          aria-label={showPass ? 'Hide password' : 'Show password'}
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="text-right">
        <a
          href="/forgot-password"
          className="text-sm hover:underline"
          style={{ color: 'var(--brand-primary)' }}
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" loading={loading} className="w-full gap-2">
        {!loading && <LogIn size={16} />}
        Sign In
      </Button>
    </form>
  );
}
