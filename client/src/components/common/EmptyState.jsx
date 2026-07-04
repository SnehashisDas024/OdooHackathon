import Button from './Button';
import { WifiOff } from 'lucide-react';

// ── Flat vector illustrations per page ──────────────────────

function IllustrationEmptySuitcase() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="40" y="40" width="80" height="60" rx="10" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2"/>
      <rect x="60" y="30" width="40" height="14" rx="6" fill="#C4B5FD" stroke="#8B5CF6" strokeWidth="1.5"/>
      <rect x="75" y="58" width="10" height="24" rx="2" fill="#8B5CF6" opacity="0.3"/>
      <rect x="65" y="68" width="30" height="4" rx="2" fill="#8B5CF6" opacity="0.3"/>
      <circle cx="55" cy="105" r="5" fill="#E3E8F4"/>
      <circle cx="105" cy="105" r="5" fill="#E3E8F4"/>
      {/* Character */}
      <circle cx="120" cy="28" r="12" fill="#3454D1"/>
      <rect x="112" y="41" width="16" height="20" rx="4" fill="#3454D1"/>
      <line x1="120" y1="61" x2="115" y2="78" stroke="#1B2559" strokeWidth="3" strokeLinecap="round"/>
      <line x1="120" y1="61" x2="125" y2="78" stroke="#1B2559" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationMagnifyingGlass() {
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="65" cy="55" r="34" fill="#EEF2FF" stroke="#3454D1" strokeWidth="2.5"/>
      <circle cx="65" cy="55" r="22" fill="white" stroke="#3454D1" strokeWidth="1.5"/>
      <line x1="89" y1="79" x2="110" y2="100" stroke="#3454D1" strokeWidth="5" strokeLinecap="round"/>
      {/* Character peering */}
      <circle cx="65" cy="48" r="8" fill="#FF6B4A"/>
      <rect x="59" y="57" width="12" height="16" rx="3" fill="#FF6B4A"/>
    </svg>
  );
}

function IllustrationCleanDesk() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="30" y="75" width="120" height="10" rx="5" fill="#E3E8F4"/>
      <rect x="50" y="40" width="80" height="36" rx="6" fill="#EEF2FF" stroke="#E3E8F4" strokeWidth="1.5"/>
      <rect x="62" y="48" width="56" height="4" rx="2" fill="#3454D1" opacity="0.3"/>
      <rect x="62" y="56" width="40" height="4" rx="2" fill="#3454D1" opacity="0.2"/>
      <rect x="62" y="64" width="48" height="4" rx="2" fill="#3454D1" opacity="0.15"/>
      {/* Character relaxing */}
      <circle cx="130" cy="30" r="12" fill="#22C55E"/>
      <rect x="122" y="42" width="16" height="20" rx="4" fill="#22C55E"/>
      <line x1="122" y1="50" x2="112" y2="58" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationDisconnected() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="80" cy="50" r="30" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2"/>
      <path d="M66 38 L94 38 M60 50 L100 50 M66 62 L94 62" stroke="#EF4444" strokeWidth="3"
        strokeLinecap="round" strokeDasharray="4 4"/>
      <line x1="60" y1="35" x2="100" y2="75" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="120" cy="25" r="10" fill="#1B2559"/>
      <rect x="114" y="36" width="12" height="16" rx="3" fill="#1B2559"/>
      <line x1="114" y1="42" x2="108" y2="50" stroke="#6B7594" strokeWidth="2" strokeLinecap="round"/>
      <line x1="126" y1="42" x2="132" y2="50" stroke="#6B7594" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const illustrations = {
  leave: IllustrationEmptySuitcase,
  search: IllustrationMagnifyingGlass,
  empty: IllustrationCleanDesk,
  error: IllustrationDisconnected,
};

/**
 * EmptyState – icon/illustration + heading + helper text + optional CTA
 */
export default function EmptyState({
  variant = 'empty',
  title,
  description,
  action,
  onAction,
  isError = false,
  onRetry,
}) {
  const Illustration = illustrations[isError ? 'error' : variant] || IllustrationCleanDesk;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <Illustration />
      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="text-lg font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
          {isError ? 'Something went wrong' : title || 'Nothing here yet'}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          {isError
            ? description || "We couldn't load this data. Check your connection and try again."
            : description || 'This section is empty right now.'}
        </p>
      </div>
      {isError && onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <WifiOff size={16} />
          Retry
        </Button>
      )}
      {!isError && action && onAction && (
        <Button onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}
