import { useState, useRef, useEffect } from 'react';
import {
  Search, Menu, Upload, FolderPlus, X, LogOut, Sparkles,
  User, Sun, Moon, Monitor, ChevronDown, Bell
} from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// Helper to decode JWT payload
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
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 topbar-bg px-4 md:px-8 z-30">
      {/* Left: Mobile menu button & Mobile Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-2xl p-2.5 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors md:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="md:hidden">
          <Logo size="sm" to="/dashboard" />
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            placeholder="Search across files, folders, and archives... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-theme w-full rounded-2xl py-3 pl-11 pr-11 text-xs shadow-xs focus:shadow-md"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-3 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none items-center gap-0.5 rounded-lg border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-text-muted">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right: Actions, Theme, and Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Theme Toggle */}
        <div className="hidden sm:block">
          <ThemeToggle variant="button" />
        </div>

        {/* New Action Dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            id="new-action-btn"
            onClick={() => setShowActions(!showActions)}
            className="btn-primary hidden md:flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Action</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showActions ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Upload button */}
          <button
            onClick={onUploadClick}
            className="btn-primary flex items-center justify-center rounded-2xl p-2.5 md:hidden cursor-pointer"
            aria-label="Upload files"
          >
            <Upload className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-13 z-50 w-56 context-menu p-1.5 animate-scaleIn">
              <button
                id="action-upload"
                onClick={() => {
                  onUploadClick();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                  <Upload className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary">Upload Files</p>
                  <p className="text-[10px] text-text-muted">Upload any file format</p>
                </div>
              </button>

              <button
                id="action-new-folder"
                onClick={() => {
                  onCreateFolderClick();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer mt-1"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
                  <FolderPlus className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary">Create Folder</p>
                  <p className="text-[10px] text-text-muted">Organize your storage</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Profile avatar dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 text-white text-sm font-bold shadow-md shadow-indigo-500/25 hover:ring-2 hover:ring-primary/60 transition-all cursor-pointer"
            aria-label="User profile menu"
          >
            {initial}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-13 z-50 w-72 context-menu p-3 animate-scaleIn">
              {/* User info */}
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base shadow-md">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Account</p>
                  <p className="text-xs font-bold text-text-primary truncate" title={email}>
                    {email}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 mt-1">
                    Free Cloud Plan
                  </span>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="py-3 border-b border-border">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Theme Mode</p>
                <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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

              {/* Sign out */}
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
