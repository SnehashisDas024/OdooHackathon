import SignInForm from '../components/auth/SignInForm';

function SignInIllustration() {
  return (
    <svg width="320" height="280" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background desk */}
      <rect x="40" y="180" width="240" height="12" rx="6" fill="#E3E8F4"/>
      {/* Monitor */}
      <rect x="100" y="90" width="120" height="90" rx="10" fill="#EEF2FF" stroke="#3454D1" strokeWidth="2"/>
      <rect x="112" y="100" width="96" height="70" rx="6" fill="white"/>
      {/* Screen content */}
      <rect x="124" y="112" width="60" height="6" rx="3" fill="#3454D1" opacity="0.4"/>
      <rect x="124" y="124" width="72" height="4" rx="2" fill="#E3E8F4"/>
      <rect x="124" y="134" width="72" height="4" rx="2" fill="#E3E8F4"/>
      <rect x="140" y="148" width="40" height="12" rx="4" fill="#3454D1"/>
      {/* Stand */}
      <rect x="150" y="180" width="20" height="15" rx="2" fill="#C7D2FE"/>
      <rect x="135" y="193" width="50" height="6" rx="3" fill="#A5B4FC"/>
      {/* Character */}
      <circle cx="235" cy="110" r="26" fill="#FF6B4A"/>
      <rect x="220" y="136" width="30" height="36" rx="8" fill="#FF6B4A"/>
      {/* Key */}
      <circle cx="265" cy="155" r="10" fill="none" stroke="#F5A623" strokeWidth="3"/>
      <line x1="271" y1="161" x2="285" y2="175" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
      <line x1="281" y1="171" x2="285" y2="167" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
      {/* Eyes */}
      <circle cx="229" cy="107" r="3" fill="white"/>
      <circle cx="241" cy="107" r="3" fill="white"/>
      <circle cx="230" cy="108" r="1.5" fill="#1B2559"/>
      <circle cx="242" cy="108" r="1.5" fill="#1B2559"/>
      {/* Smile */}
      <path d="M229 118 Q235 124 241 118" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export default function SignInPage() {
  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[520px]"
      style={{ border: '1px solid var(--border-hairline)' }}>
      {/* Left – illustration */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 p-10 gap-6"
        style={{ background: 'linear-gradient(145deg, #EEF2FF 0%, #FFF0EB 100%)' }}>
        <SignInIllustration />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'var(--brand-primary)', fontFamily: 'Sora, sans-serif' }}>H</div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>HRMS</span>
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>Sign In</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Use your Login ID or email to continue.
          </p>
        </div>
        {/* Demo credentials banner */}
        <div className="mb-5 p-3 rounded-xl text-xs" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          <p className="font-semibold mb-1.5" style={{ color: 'var(--brand-primary)', fontFamily: 'Sora, sans-serif' }}>Demo Accounts</p>
          <div className="flex flex-col gap-1" style={{ color: '#3730A3', fontFamily: 'IBM Plex Mono, monospace' }}>
            <span>👑 admin@hrms.com / Admin@1234</span>
            <span>👤 arjun.sharma@hrms.com / Employee@1234</span>
          </div>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
