import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

function LostIllustration() {
  return (
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Ground */}
      <rect x="30" y="170" width="180" height="10" rx="5" fill="#E3E8F4"/>
      {/* Big 404 text background */}
      <text x="120" y="145" textAnchor="middle" fontFamily="Sora, sans-serif" fontSize="80" fontWeight="800"
        fill="#EEF2FF">404</text>
      <text x="120" y="145" textAnchor="middle" fontFamily="Sora, sans-serif" fontSize="80" fontWeight="800"
        fill="#3454D1" fillOpacity="0.15">404</text>
      {/* Character */}
      <circle cx="120" cy="55" r="24" fill="#FF6B4A"/>
      <rect x="106" y="79" width="28" height="36" rx="8" fill="#FF6B4A"/>
      {/* Question marks */}
      <text x="80" y="44" fontFamily="Sora, sans-serif" fontSize="22" fill="#3454D1" fontWeight="700" opacity="0.5">?</text>
      <text x="148" y="38" fontFamily="Sora, sans-serif" fontSize="16" fill="#8B5CF6" fontWeight="700" opacity="0.5">?</text>
      <text x="155" y="70" fontFamily="Sora, sans-serif" fontSize="20" fill="#FF6B4A" fontWeight="700" opacity="0.4">?</text>
      {/* Eyes */}
      <circle cx="113" cy="51" r="4" fill="white"/>
      <circle cx="127" cy="51" r="4" fill="white"/>
      <circle cx="114" cy="52" r="2" fill="#1B2559"/>
      <circle cx="128" cy="52" r="2" fill="#1B2559"/>
      {/* Mouth – confused */}
      <path d="M112 64 Q120 60 128 64" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Legs */}
      <line x1="112" y1="115" x2="108" y2="140" stroke="#1B2559" strokeWidth="5" strokeLinecap="round"/>
      <line x1="128" y1="115" x2="132" y2="140" stroke="#1B2559" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F6F8FC 60%, #FFF0EB 100%)' }}>
      <LostIllustration />
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
          Page not found
        </h1>
        <p className="text-sm max-w-xs" style={{ color: 'var(--ink-muted)' }}>
          The page you're looking for doesn't exist, or you may not have access to it.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
