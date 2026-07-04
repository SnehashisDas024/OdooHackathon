// Buffer / Loading Animation Component
// Replaces all spinners per the frontend prompt spec.
// Each variant is a small looping flat-vector SVG animation.

const captions = {
  'walking-doc': 'Loading, please wait…',
  'clock-spin': 'Fetching attendance data…',
  'paper-plane': 'Submitting your request…',
  'coin-stack': 'Calculating salary breakdown…',
  'card-shuffle': 'Fetching employees…',
  'upload-arrow': 'Uploading your file…',
};

// ── Individual SVG animations ──────────────────────────────

function WalkingDoc({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes wdBody { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes wdFolder { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        @keyframes wdPath { 0%{stroke-dashoffset:80} 100%{stroke-dashoffset:0} }
        @keyframes wdLeg1 { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
        @keyframes wdLeg2 { 0%,100%{transform:rotate(15deg)} 50%{transform:rotate(-15deg)} }
        @media(prefers-reduced-motion:reduce){.wd-body,.wd-folder,.wd-leg1,.wd-leg2{animation:none!important}}
      `}</style>
      {/* Dashed path */}
      <line x1="10" y1="78" x2="90" y2="78" stroke="#E3E8F4" strokeWidth="2" strokeDasharray="6 4"/>
      {/* Body */}
      <g className="wd-body" style={{ transformOrigin:'50px 55px', animation:'wdBody 1s ease-in-out infinite' }}>
        {/* Head */}
        <circle cx="50" cy="32" r="10" fill="#3454D1"/>
        {/* Torso */}
        <rect x="42" y="43" width="16" height="20" rx="4" fill="#3454D1"/>
        {/* Folder */}
        <g className="wd-folder" style={{ transformOrigin:'62px 50px', animation:'wdFolder 1s ease-in-out infinite' }}>
          <rect x="56" y="46" width="18" height="14" rx="2" fill="#FF6B4A"/>
          <rect x="56" y="44" width="8" height="4" rx="1" fill="#FF6B4A"/>
          <line x1="59" y1="51" x2="71" y2="51" stroke="white" strokeWidth="1.5"/>
          <line x1="59" y1="55" x2="68" y2="55" stroke="white" strokeWidth="1.5"/>
        </g>
        {/* Legs */}
        <rect className="wd-leg1" x="44" y="62" width="6" height="14" rx="3" fill="#1B2559"
          style={{ transformOrigin:'47px 62px', animation:'wdLeg1 0.6s ease-in-out infinite' }}/>
        <rect className="wd-leg2" x="50" y="62" width="6" height="14" rx="3" fill="#1B2559"
          style={{ transformOrigin:'53px 62px', animation:'wdLeg2 0.6s ease-in-out infinite' }}/>
      </g>
    </svg>
  );
}

function ClockSpin({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes csHour { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes csMin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes csCup { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        @media(prefers-reduced-motion:reduce){.cs-hour,.cs-min,.cs-cup{animation:none!important}}
      `}</style>
      <circle cx="48" cy="48" r="28" stroke="#3454D1" strokeWidth="3" fill="#EEF2FF"/>
      <g style={{ transformOrigin:'48px 48px' }}>
        <line className="cs-hour" x1="48" y1="48" x2="48" y2="30" stroke="#1B2559" strokeWidth="3" strokeLinecap="round"
          style={{ transformOrigin:'48px 48px', animation:'csHour 8s linear infinite' }}/>
        <line className="cs-min" x1="48" y1="48" x2="62" y2="48" stroke="#3454D1" strokeWidth="2" strokeLinecap="round"
          style={{ transformOrigin:'48px 48px', animation:'csMin 2s linear infinite' }}/>
      </g>
      <circle cx="48" cy="48" r="3" fill="#FF6B4A"/>
      {/* Coffee cup */}
      <g className="cs-cup" style={{ transformOrigin:'80px 68px', animation:'csCup 1.5s ease-in-out infinite' }}>
        <rect x="72" y="62" width="16" height="12" rx="3" fill="#FF6B4A"/>
        <path d="M88 67 Q94 67 94 72 Q94 77 88 77" stroke="#FF6B4A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="74" y1="60" x2="74" y2="62" stroke="#6B7594" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="78" y1="58" x2="78" y2="62" stroke="#6B7594" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="82" y1="60" x2="82" y2="62" stroke="#6B7594" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="72" y="74" width="16" height="2" rx="1" fill="#1B2559" opacity="0.3"/>
      </g>
    </svg>
  );
}

function PaperPlane({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes ppFly {
          0%   { transform: translate(0px, 0px) rotate(-5deg); }
          25%  { transform: translate(25px, -12px) rotate(0deg); }
          50%  { transform: translate(50px, 0px) rotate(5deg); }
          75%  { transform: translate(25px, 12px) rotate(0deg); }
          100% { transform: translate(0px, 0px) rotate(-5deg); }
        }
        @media(prefers-reduced-motion:reduce){.pp-plane{animation:none!important; transform:translate(30px,0)!important}}
      `}</style>
      <line x1="15" y1="40" x2="105" y2="40" stroke="#E3E8F4" strokeWidth="1.5" strokeDasharray="5 4"/>
      <g className="pp-plane" style={{ animation:'ppFly 3s ease-in-out infinite' }}>
        <path d="M10 42 L38 28 L32 42 Z" fill="#3454D1"/>
        <path d="M10 42 L38 56 L32 42 Z" fill="#8B5CF6"/>
        <path d="M32 42 L38 28 L38 56 Z" fill="#FF6B4A"/>
      </g>
    </svg>
  );
}

function CoinStack({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes coin1 { 0%,60%,100%{opacity:1;transform:translateY(0)} 30%{opacity:0;transform:translateY(-20px)} }
        @keyframes coin2 { 0%,30%,100%{opacity:1} 15%{opacity:0;transform:translateY(-15px)} }
        @keyframes coin3 { 0%,100%{opacity:1} 5%{opacity:0;transform:translateY(-10px)} }
        @media(prefers-reduced-motion:reduce){.cs1,.cs2,.cs3{animation:none!important}}
      `}</style>
      <ellipse cx="50" cy="80" rx="22" ry="6" fill="#E3E8F4"/>
      <g className="cs3" style={{ animation:'coin3 2s ease-in-out infinite 0.4s' }}>
        <ellipse cx="50" cy="72" rx="22" ry="6" fill="#F5A623"/>
        <rect x="28" y="60" width="44" height="12" rx="0" fill="#F5A623"/>
        <ellipse cx="50" cy="60" rx="22" ry="6" fill="#FFD085"/>
      </g>
      <g className="cs2" style={{ animation:'coin2 2s ease-in-out infinite 0.2s' }}>
        <ellipse cx="50" cy="56" rx="22" ry="6" fill="#3454D1"/>
        <rect x="28" y="44" width="44" height="12" rx="0" fill="#3454D1"/>
        <ellipse cx="50" cy="44" rx="22" ry="6" fill="#6B8AF4"/>
      </g>
      <g className="cs1" style={{ animation:'coin1 2s ease-in-out infinite' }}>
        <ellipse cx="50" cy="40" rx="22" ry="6" fill="#FF6B4A"/>
        <rect x="28" y="28" width="44" height="12" rx="0" fill="#FF6B4A"/>
        <ellipse cx="50" cy="28" rx="22" ry="6" fill="#FF9A85"/>
      </g>
    </svg>
  );
}

function CardShuffle({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 130 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes card1 { 0%,100%{transform:translateX(0) rotate(-8deg); opacity:0.7} 40%{transform:translateX(-15px) rotate(-12deg); opacity:0.9} }
        @keyframes card2 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-5px)} }
        @keyframes card3 { 0%,100%{transform:translateX(0) rotate(8deg); opacity:0.7} 60%{transform:translateX(15px) rotate(12deg); opacity:0.9} }
        @media(prefers-reduced-motion:reduce){.crd1,.crd2,.crd3{animation:none!important}}
      `}</style>
      {/* Card 1 */}
      <g className="crd1" style={{ transformOrigin:'40px 40px', animation:'card1 1.6s ease-in-out infinite' }}>
        <rect x="10" y="15" width="60" height="50" rx="8" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.5"/>
        <circle cx="28" cy="33" r="8" fill="#8B5CF6"/>
        <rect x="40" y="30" width="22" height="6" rx="3" fill="#C4B5FD"/>
      </g>
      {/* Card 2 */}
      <g className="crd2" style={{ transformOrigin:'65px 40px', animation:'card2 1.6s ease-in-out infinite 0.2s' }}>
        <rect x="35" y="15" width="60" height="50" rx="8" fill="#EEF2FF" stroke="#3454D1" strokeWidth="1.5"/>
        <circle cx="53" cy="33" r="8" fill="#3454D1"/>
        <rect x="65" y="30" width="22" height="6" rx="3" fill="#A5B4FC"/>
      </g>
      {/* Card 3 */}
      <g className="crd3" style={{ transformOrigin:'90px 40px', animation:'card3 1.6s ease-in-out infinite 0.4s' }}>
        <rect x="60" y="15" width="60" height="50" rx="8" fill="#FFF0EB" stroke="#FF6B4A" strokeWidth="1.5"/>
        <circle cx="78" cy="33" r="8" fill="#FF6B4A"/>
        <rect x="90" y="30" width="22" height="6" rx="3" fill="#FCA88E"/>
      </g>
    </svg>
  );
}

function UploadArrow({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes uaArrow { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(-14px);opacity:0.3} }
        @keyframes uaDot { 0%{transform:translateY(0);opacity:0} 50%{opacity:1} 100%{transform:translateY(-20px);opacity:0} }
        @media(prefers-reduced-motion:reduce){.ua-arrow,.ua-dot{animation:none!important}}
      `}</style>
      {/* Cloud */}
      <path d="M30 68 Q20 68 20 56 Q20 44 32 44 Q34 34 46 32 Q60 30 64 42 Q76 42 76 54 Q76 68 64 68 Z"
        fill="#EEF2FF" stroke="#3454D1" strokeWidth="2"/>
      {/* Arrow */}
      <g className="ua-arrow" style={{ transformOrigin:'50px 62px', animation:'uaArrow 1.4s ease-in-out infinite' }}>
        <line x1="50" y1="82" x2="50" y2="56" stroke="#3454D1" strokeWidth="3" strokeLinecap="round"/>
        <polyline points="40,65 50,55 60,65" stroke="#3454D1" strokeWidth="3" fill="none"
          strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      {/* Dots */}
      {[42, 50, 58].map((x, i) => (
        <circle key={x} className="ua-dot" cx={x} cy="82" r="3" fill="#FF6B4A"
          style={{ animation:`uaDot 1.4s ease-in-out infinite ${i * 0.2}s` }}/>
      ))}
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────

const variants = {
  'walking-doc': WalkingDoc,
  'clock-spin': ClockSpin,
  'paper-plane': PaperPlane,
  'coin-stack': CoinStack,
  'card-shuffle': CardShuffle,
  'upload-arrow': UploadArrow,
};

/**
 * BufferAnimation – replaces all spinners in the app.
 * @param {'walking-doc'|'clock-spin'|'paper-plane'|'coin-stack'|'card-shuffle'|'upload-arrow'} variant
 * @param {'sm'|'md'|'lg'} size  sm=96px, md=140px, lg=220px
 * @param {string} caption Override default caption
 */
export default function BufferAnimation({ variant = 'walking-doc', size = 'md', caption }) {
  const px = size === 'sm' ? 72 : size === 'lg' ? 220 : 120;
  const SvgComp = variants[variant] || WalkingDoc;
  const text = caption || captions[variant] || 'Loading…';

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6" role="status" aria-live="polite">
      <SvgComp size={px} />
      <p className="text-sm" style={{ color: 'var(--ink-muted)', fontFamily: 'Inter, sans-serif' }}>
        {text}
      </p>
    </div>
  );
}
