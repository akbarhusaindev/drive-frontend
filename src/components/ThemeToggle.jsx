import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, variant = 'button' }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface-2/60 text-text-secondary hover:bg-surface-3 hover:text-text-primary hover:border-primary/40 transition-all duration-200 shadow-xs cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/40"
        title={`Current: ${theme} mode. Click to switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label="Toggle theme"
      >
        <div className="relative h-4.5 w-4.5">
          <Sun
            className={`absolute inset-0 h-4.5 w-4.5 text-amber-500 transition-all duration-300 transform ${
              resolvedTheme === 'dark'
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <Moon
            className={`absolute inset-0 h-4.5 w-4.5 text-indigo-400 transition-all duration-300 transform ${
              resolvedTheme === 'dark'
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
      </button>
    );
  }

  // Dropdown variant
  const options = [
    { value: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
    { value: 'dark', label: 'Dark', icon: Moon, color: 'text-indigo-400' },
    { value: 'system', label: 'System', icon: Monitor, color: 'text-slate-400' },
  ];

  const CurrentIcon =
    theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2/60 px-3.5 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-3 hover:text-text-primary hover:border-primary/40 transition-all shadow-xs cursor-pointer"
      >
        <CurrentIcon className="h-4 w-4 text-primary" />
        {showLabel && <span className="capitalize">{theme}</span>}
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-36 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-xl backdrop-blur-2xl animate-scaleIn">
          {options.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                theme === value
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
