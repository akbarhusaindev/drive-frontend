import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import ThemeToggle from '../components/ThemeToggle';
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
      toast.success('Welcome back!');
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
      className="relative flex min-h-screen items-center justify-center p-4 selection:bg-primary/20 selection:text-primary transition-colors duration-300"
      style={{ background: 'var(--auth-bg)' }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#16172e' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.2)',
            fontSize: '13px',
            fontWeight: 500,
          },
        }}
      />

      {/* Floating Theme Toggle at top right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle variant="dropdown" showLabel={false} />
      </div>

      {/* Decorative ambient glowing orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[120px] dark:bg-indigo-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[120px] dark:bg-purple-600/20" />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        {/* Brand Logo & Title */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30">
            <Cloud className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text tracking-tight mb-1">Cloud Drive</h1>
          <p className="text-text-muted text-xs font-medium">Sign in to your secure cloud storage account</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-surface/85 p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-theme w-full rounded-xl py-3 pl-10 pr-4 text-xs shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-theme w-full rounded-xl py-3 pl-10 pr-10 text-xs shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
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
              className="btn-primary mt-2 w-full rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}