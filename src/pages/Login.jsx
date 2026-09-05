import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, Server } from 'lucide-react';
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
  const [slowServerMessage, setSlowServerMessage] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const timerRef = useRef(null);

  useEffect(() => {
    authService.warmUpServer();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setSlowServerMessage(false);

    timerRef.current = setTimeout(() => {
      setSlowServerMessage(true);
    }, 2500);

    try {
      const { data } = await authService.login(email.trim(), password);
      localStorage.setItem('token', data.token);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error')) {
        toast.error('Server is waking up. Please try once more.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Invalid email or password');
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Unable to sign in. Please try again.');
      }
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(false);
      setSlowServerMessage(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-[var(--bg-app)]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: resolvedTheme === 'dark' ? '#18181c' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f4f4f5' : '#0f172a',
            border: resolvedTheme === 'dark' ? '1px solid #27272a' : '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 500,
          },
        }}
      />

      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="button" />
      </div>

      <div className="w-full max-w-sm animate-fadeInUp">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Logo size="md" to="/dashboard" className="mb-4" />
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Welcome back
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Sign in to your Cloud Drive account
          </p>
        </div>

        {/* Form Card */}
        <div className="modern-card rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="input-theme w-full rounded-lg py-2 pl-9 pr-3 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-text-secondary">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="input-theme w-full rounded-lg py-2 pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Slow Server Notice */}
            {slowServerMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-xs text-blue-600 dark:text-blue-400">
                <Server className="h-4 w-4 shrink-0 animate-pulse" />
                <p className="text-[11px] leading-tight">
                  Server is waking up from idle mode, please hold on...
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}