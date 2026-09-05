import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HardDrive, Trash2, Users, X, LogOut, ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';
import Logo from './Logo';
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
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col sidebar-bg transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <Logo size="sm" to="/dashboard" />
          <button
            className="rounded-lg p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary md:hidden transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-2 text-text-primary font-semibold'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                  }`}
                />
                <span className="flex-1 truncate">{name}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-border p-3 flex items-center justify-between gap-2">
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="shrink-0">
            <ThemeToggle variant="button" />
          </div>
        </div>
      </aside>
    </>
  );
}