import { Link } from 'react-router-dom';

/**
 * Handcrafted Cloud Drive Brand Mark
 * Clean, geometric, architectural logo
 */
export function LogoIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${currentSize} ${className}`}>
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Brand Logo component with clean typography
 */
export default function Logo({
  size = 'md',
  showText = true,
  to = '/dashboard',
  className = '',
}) {
  const textSizes = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
  };

  const currentText = textSizes[size] || textSizes.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <span className={`tracking-tight font-heading text-text-primary ${currentText}`}>
          Cloud Drive
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="focus:outline-none inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
