import { Link } from 'react-router-dom';

/**
 * Custom Cloud Drive Vector Icon
 * A sleek geometric prism cloud with luminous gradient depth
 */
export function LogoIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-13 w-13',
    xl: 'h-16 w-16',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${currentSize} ${className}`}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/40 via-purple-500/30 to-cyan-400/40 blur-md transition-all duration-300 group-hover:blur-lg group-hover:scale-110" />

      {/* Main Logo Container */}
      <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#0f1123] to-[#1e1035] p-2 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:border-indigo-400/60">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
        >
          <defs>
            {/* Main Gradient */}
            <linearGradient id="cloudGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Facet / Prism Gradients */}
            <linearGradient id="facetTop" x1="10" y1="8" x2="26" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="facetBottom" x1="6" y1="18" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Cloud Outline & Modern Geometric Facets */}
          <path
            d="M12.5 13C13.6 9.5 17 7 21 7C25.8 7 29.8 10.6 30 15.4C32.3 16.2 34 18.4 34 21C34 24.3 31.3 27 28 27H10C6.7 27 4 24.3 4 21C4 18 6.2 15.6 9.1 15.1C9.6 14.1 10.3 13.3 11.2 12.7"
            stroke="url(#cloudGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />

          {/* Geometric Central Core / Prism Node */}
          <path
            d="M18 11.5L24 16L18 20.5L12 16L18 11.5Z"
            fill="url(#facetTop)"
            opacity="0.95"
          />
          <path
            d="M12 16L18 20.5V26.5L12 22V16Z"
            fill="url(#facetBottom)"
            opacity="0.9"
          />
          <path
            d="M24 16L18 20.5V26.5L24 22V16Z"
            fill="url(#cloudGrad)"
            opacity="0.8"
          />

          {/* Sparkle / Data connection point */}
          <circle cx="18" cy="20.5" r="1.5" fill="#ffffff" filter="url(#neonGlow)" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Brand Logo component with Text & Subtitle
 */
export default function Logo({
  size = 'md',
  showText = true,
  showBadge = true,
  to = '/dashboard',
  className = '',
}) {
  const textSizes = {
    sm: { title: 'text-sm', subtitle: 'text-[9px]' },
    md: { title: 'text-base', subtitle: 'text-[10px]' },
    lg: { title: 'text-2xl', subtitle: 'text-xs' },
    xl: { title: 'text-3xl', subtitle: 'text-xs' },
  };

  const currentText = textSizes[size] || textSizes.md;

  const content = (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight font-heading gradient-text ${currentText.title}`}
            >
              Cloud<span className="font-light text-indigo-400">Drive</span>
            </span>
            {showBadge && (
              <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                PRO
              </span>
            )}
          </div>
          {size !== 'sm' && (
            <span
              className={`font-semibold tracking-wider uppercase text-text-muted ${currentText.subtitle}`}
            >
              Next-Gen Cloud Hub
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
