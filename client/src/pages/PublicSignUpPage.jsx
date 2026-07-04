import PublicSignUpForm from '../components/auth/PublicSignUpForm';
import { UserPlus } from 'lucide-react';

export default function PublicSignUpPage() {
  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10" style={{ border: '1px solid var(--border-hairline)' }}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium px-3 py-1.5 rounded-full w-fit"
            style={{ background: '#EEF2FF', color: 'var(--brand-primary)' }}>
            <UserPlus size={14} />
            Employee Registration
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
            Join the team
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Create your employee profile below. After submission, your custom Login ID will be displayed.
          </p>
        </div>
        <PublicSignUpForm />
        
        <div className="mt-8 text-center border-t pt-6" style={{ borderColor: 'var(--border-hairline)' }}>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            Already have an account?{' '}
            <a href="/sign-in" className="font-semibold transition-all hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
