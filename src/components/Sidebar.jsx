import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HardDrive, Trash2, Users, X, LogOut, ChevronRight,
  Upload, FolderPlus, ShieldCheck, Database, Sparkles
} from 'lucide-react';
import { authService } from '../services/authService';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import toast from 'react-hot-toast';

const navItems = [
  {
    name: 'My Drive',
    path: '/dashboard',
    icon: HardDrive,
    color: 'text-indigo-500',
    activeBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',
  },
  {
    name: 'Shared with me',
    path: '/shared',
    icon: Users,
    color: 'text-purple-500',
    activeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/25',
  },
  {
    name: 'Trash',
    path: '/trash',
    icon: Trash2,
    color: 'text-rose-500',
    activeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
  },
];

// Helper to decode email for profile display
const decodeEmail = (token) => {
  if (!token) return 'User';
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload)?.sub || 'User';
  } catch {
    return 'User';
  }
};

export default function Sidebar({ isOpen, setIsOpen, onUploadClick, onCreateFolderClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = authService.getToken();
  const email = decodeEmail(token);
  const initial = email.charAt(0).toUpperCase();

  const handleLogout = () => {
    authService.logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col sidebar-bg border-r border-border transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          <Logo size="md" to="/dashboard" />
          <button
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary md:hidden transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Button in Sidebar */}
        {(onUploadClick || onCreateFolderClick) && (
          <div className="px-5 pt-5 pb-2">
            <button
              onClick={() => {
                if (onUploadClick) onUploadClick();
                setIsOpen(false);
              }}
              className="btn-primary w-full flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 text-xs font-bold tracking-wide cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              <Upload className="h-4 w-4" />
              <span>Upload New Files</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          <div className="px-3 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Storage Views
          </div>
          {navItems.map(({ name, path, icon: Icon, color, activeBg }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? `${activeBg} font-semibold shadow-xs`
                    : 'border-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/20 text-primary shadow-xs'
                      : 'bg-surface-2 text-text-muted group-hover:text-text-primary group-hover:bg-surface-3'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="flex-1 truncate">{name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-primary opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storage Widget */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-border bg-surface-2/70 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-text-primary">Cloud Storage</span>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Active
              </span>
            </div>

            {/* Storage Progress bar */}
            <div className="storage-bar h-2 w-full mb-2">
              <div className="storage-fill h-full" style={{ width: '28%' }} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span>4.2 GB used</span>
              <span>15 GB total</span>
            </div>
          </div>
        </div>

        {/* Footer User Profile & Actions */}
        <div className="border-t border-border p-3.5 flex items-center justify-between gap-2 bg-surface-2/30">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-text-primary" title={email}>
                {email}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle variant="button" />
            <button
              onClick={handleLogout}
              className="rounded-xl p-2 text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}