import { useState, useRef, useEffect } from 'react';
import { Search, Menu, Upload, FolderPlus, X, LogOut, User } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
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
  } catch (e) {
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
  
  const actionsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Get user email from JWT
  const token = authService.getToken();
  const decoded = decodeJwt(token);
  const email = decoded?.sub || 'User';
  const initial = email.charAt(0).toUpperCase();

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

  const handleLogout = () => {
    authService.logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/5 bg-[#0a0a1f]/80 backdrop-blur-xl px-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo (mobile only) */}
      <span className="text-base font-bold gradient-text md:hidden">Drive</span>

      {/* Search bar */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <input
            id="search-input"
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark w-full rounded-xl py-2.5 pl-9 pr-9 text-sm"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* New button dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            id="new-action-btn"
            onClick={() => setShowActions(!showActions)}
            className="btn-primary hidden md:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold animate-fadeInUp"
          >
            <FolderPlus className="h-4 w-4" />
            New
          </button>

          {/* Mobile: upload shortcut */}
          <button
            onClick={onUploadClick}
            className="btn-primary flex items-center justify-center rounded-xl p-2.5 md:hidden"
          >
            <Upload className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-12 z-50 w-48 context-menu py-2 animate-fadeInUp">
              <button
                id="action-upload"
                onClick={() => { onUploadClick(); setShowActions(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Upload className="h-4 w-4 text-indigo-400" />
                Upload Files
              </button>
              <button
                id="action-new-folder"
                onClick={() => { onCreateFolderClick(); setShowActions(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FolderPlus className="h-4 w-4 text-purple-400" />
                New Folder
              </button>
            </div>
          )}
        </div>

        {/* User avatar with dropdown menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg hover:ring-2 hover:ring-indigo-500/50 transition-all cursor-pointer"
          >
            {initial}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 z-50 w-56 context-menu py-2.5 animate-fadeInUp border border-white/10 shadow-2xl">
              {/* User details */}
              <div className="px-4 py-2 border-b border-white/5">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-slate-200 truncate mt-0.5" title={email}>{email}</p>
              </div>
              
              {/* Menu Actions */}
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
