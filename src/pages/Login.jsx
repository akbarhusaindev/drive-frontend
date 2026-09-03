import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      toast.success('Welcome back to Cloud Drive!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-4 selection:bg-indigo-500/20 selection:text-indigo-400 transition-colors duration-300 bg-grid-pattern"
      style={{ background: 'var(--auth-bg)' }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#14162d' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            boxShadow: '0 16px 36px -8px rgba(0,0,0,0.25)',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />

      {/* Floating Theme Toggle at top right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="button" />
      </div>

      {/* Decorative ambient glowing orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-indigo-500/15 blur-[140px] dark:bg-indigo-600/25 animate-float" />
        <div className="absolute -bottom-40 -right-40 h-[550px] w-[550px] rounded-full bg-purple-500/15 blur-[140px] dark:bg-purple-600/25 animate-float" />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        {/* Brand Logo & Title */}
        <div className="mb-8 text-center flex flex-col items-center">
          <Logo size="lg" to={null} className="mb-3" />
          <p className="text-text-muted text-xs font-medium max-w-xs">
            Sign in to access your secure cloud storage and collaborate seamlessly
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border/80 bg-surface/90 p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-bold text-text-secondary">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-theme w-full rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-bold text-text-secondary">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-theme w-full rounded-2xl py-3.5 pl-11 pr-11 text-xs font-medium shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary mt-3 w-full rounded-2xl py-3.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 pt-5 border-t border-border flex items-center justify-around text-[10px] text-text-muted font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Instant Access</span>
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-5 text-center">
            <p className="text-xs text-text-muted font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}