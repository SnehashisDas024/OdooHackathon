import SignInForm from '../components/auth/SignInForm';

function SignInIllustration() {
  return (
    <img
      src="/pic.png"
      alt="Sign in illustration"
      className="w-80 h-auto"
      aria-hidden={false}
    />
  );
}

export default function SignInPage() {
  return (
    <div className="neumorphic-convex w-full max-w-4xl rounded-3xl overflow-hidden flex min-h-[520px]">
      {/* Left – illustration */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 p-10 gap-6"
        style={{ background: 'var(--bg-surface)' }}>
        <SignInIllustration />
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-2" style={{ fontFamily: 'Avenir Next, Nunito, Inter, sans-serif', color: 'var(--ink-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            Every workday, perfectly aligned.
          </p>
        </div>
      </div>

      {/* Right – form */}
      <div className="flex flex-col justify-center w-full md:max-w-sm p-8 md:p-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="logo-mark w-9 h-9 rounded-full flex items-center justify-center font-medium">H</div>
            <span className="font-medium text-lg" style={{ fontFamily: 'Avenir Next, Nunito, Inter, sans-serif', color: 'var(--ink-primary)' }}>HRMS</span>
          </div>
          <h2 className="text-2xl font-medium" style={{ fontFamily: 'Avenir Next, Nunito, Inter, sans-serif', color: 'var(--ink-primary)' }}>Sign In</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Use your Login ID or email to continue.
          </p>
        </div>
        {/* Demo credentials banner */}
        <div className="neumorphic-concave mb-5 p-3 rounded-xl text-xs">
          <p className="font-medium mb-1.5" style={{ color: 'var(--ink-primary)', fontFamily: 'Avenir Next, Nunito, Inter, sans-serif' }}>Demo Accounts</p>
          <div className="flex flex-col gap-1" style={{ color: 'var(--ink-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
            <span>👑 admin@hrms.com / Admin@1234</span>
            <span>👤 arjun.sharma@hrms.com / Employee@1234</span>
          </div>
        </div>
        <SignInForm />
        
        <div className="mt-6 text-center border-t pt-4" style={{ borderColor: 'var(--border-hairline)' }}>
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            New here?{' '}
            <a href="/sign-up" className="font-semibold transition-all hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Register as employee
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
