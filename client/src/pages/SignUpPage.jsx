import SignUpForm from '../components/auth/SignUpForm';
import { UserPlus } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="max-w-2xl w-full mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10" style={{ border: '1px solid var(--border-hairline)' }}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium px-3 py-1.5 rounded-full w-fit"
            style={{ background: '#EEF2FF', color: 'var(--brand-primary)' }}>
            <UserPlus size={14} />
            Admin only
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
            Add a new employee
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Fill in the details below. A Login ID and temporary password will be auto-generated.
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
