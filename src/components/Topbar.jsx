import { useState, useRef, useEffect } from 'react';
import { Search, Menu, Upload, FolderPlus, X, LogOut, Plus, Sun, Moon, Monitor } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// Helper to decode JWT payload on frontend
const decodeJwt = (token) => {
  if (!token) return null;
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
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function Topbar({
  onMenuClick,
  searchQuery,
  setSearchQuery,
  onUploadClick,
  onCreateFolderClick,
}) {
  const [showActions, setShowActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);
  const actionsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Get user email from JWT
  const token = authService.getToken();
  const decoded = decodeJwt(token);
  const email = decoded?.sub || 'User';
  const initial = email.charAt(0).toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 topbar-bg px-4 md:px-6 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Logo */}
      <div className="md:hidden">
        <Logo size="sm" showText={false} />
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative group">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-theme w-full rounded-lg py-1.5 pl-9 pr-14 text-xs shadow-xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none items-center rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* New button dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            id="new-action-btn"
            onClick={() => setShowActions(!showActions)}
            className="btn-primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showActions && (
            <div className="absolute right-0 top-10 z-50 w-48 context-menu p-1 animate-fadeInUp">
              <button
                id="action-upload"
                onClick={() => {
                  onUploadClick();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 text-primary" />
                <span>Upload Files</span>
              </button>
              <button
                id="action-new-folder"
                onClick={() => {
                  onCreateFolderClick();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
              >
                <FolderPlus className="h-4 w-4 text-text-muted" />
                <span>New Folder</span>
              </button>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-border text-text-primary text-xs font-bold hover:border-border-strong transition-colors cursor-pointer"
            aria-label="User profile"
          >
            {initial}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-10 z-50 w-56 context-menu p-1.5 animate-fadeInUp">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-semibold text-text-primary truncate mt-0.5" title={email}>
                  {email}
                </p>
              </div>

              {/* Theme Selector */}
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1.5">Theme</p>
                <div className="grid grid-cols-3 gap-1 bg-surface-2 p-0.5 rounded-md">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Sun className="h-3 w-3" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Moon className="h-3 w-3" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                      theme === 'system'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                    Auto
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
