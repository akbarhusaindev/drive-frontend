import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Cloud, HardDrive, Trash2, Users, X, LogOut, ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const navItems = [
  { name: 'My Drive', path: '/dashboard', icon: HardDrive },
  { name: 'Shared with me', path: '/shared', icon: Users },
  { name: 'Trash', path: '/trash', icon: Trash2 },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col sidebar-bg transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold gradient-text tracking-tight">Cloud Drive</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">Storage Hub</span>
            </div>
          </Link>
          <button
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary md:hidden transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Overview
          </div>
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/25 font-semibold shadow-xs'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                  }`}
                />
                <span className="flex-1 truncate">{name}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-primary opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-border p-3 flex items-center justify-between gap-2">
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          
          <div className="shrink-0 md:hidden">
            <ThemeToggle variant="button" />
          </div>
        </div>
      </aside>
    </>
  );
}