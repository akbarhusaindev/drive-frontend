import { useState, useRef, useEffect } from 'react';
import { Search, Menu, Upload, FolderPlus, X, LogOut, Sparkles, User, Sun, Moon, Monitor } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// Helper to decode JWT payload on the frontend
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

  // Keyboard shortcut for search (⌘K / Ctrl+K)
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
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 topbar-bg px-4 md:px-6 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-xl p-2 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo (mobile only) */}
      <span className="text-base font-bold gradient-text md:hidden">Cloud Drive</span>

      {/* Search bar */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative group">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            placeholder="Search files and folders... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-theme w-full rounded-xl py-2.5 pl-10 pr-10 text-sm shadow-xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none items-center gap-0.5 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Theme Toggle in Topbar */}
        <div className="hidden sm:block">
          <ThemeToggle variant="button" />
        </div>

        {/* New button dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            id="new-action-btn"
            onClick={() => setShowActions(!showActions)}
            className="btn-primary hidden md:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer shadow-md shadow-indigo-500/20"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New</span>
          </button>

          {/* Mobile: upload shortcut */}
          <button
            onClick={onUploadClick}
            className="btn-primary flex items-center justify-center rounded-xl p-2.5 md:hidden cursor-pointer"
            aria-label="Upload files"
          >
            <Upload className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-12 z-50 w-52 context-menu py-1.5 animate-fadeInUp">
              <button
                id="action-upload"
                onClick={() => {
                  onUploadClick();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500">
                  <Upload className="h-4 w-4" />
                </div>
                <span>Upload Files</span>
              </button>
              <button
                id="action-new-folder"
                onClick={() => {
                  onCreateFolderClick();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-500">
                  <FolderPlus className="h-4 w-4" />
                </div>
                <span>New Folder</span>
              </button>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-500/25 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
            aria-label="User profile menu"
          >
            {initial}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 z-50 w-64 context-menu py-2 animate-fadeInUp">
              {/* User details */}
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-text-primary truncate mt-0.5" title={email}>
                  {email}
                </p>
              </div>

              {/* Theme Selector inside menu */}
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      theme === 'system'
                        ? 'bg-surface text-primary shadow-xs font-semibold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Auto
                  </button>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
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
