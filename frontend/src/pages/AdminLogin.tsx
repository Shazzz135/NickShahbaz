import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Lock, Mail, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect straight to dashboard
  React.useEffect(() => {
    if (user) {
      const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, navigate, location]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white bg-grid-pattern crimson-ambient flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#e50914]/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Back to Site Link */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-xs font-mono text-[#94949e] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Portfolio
      </button>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <span className="p-3 rounded-2xl bg-[#0f0f13] border border-white/10 text-[#ff1e27] shadow-[0_0_20px_rgba(229,9,20,0.3)]">
              <Shield className="w-6 h-6" />
            </span>
          </div>
          <Badge variant="crimson" dot>Security Gateway</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Admin Authentication
          </h1>
          <p className="text-xs text-[#94949e]">
            Access the content management system and database control center.
          </p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-[#0d0d10]/95 border-white/10 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-[#e50914]/40 flex items-start gap-3 text-xs text-[#ff6b72]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary: Google OAuth Sign-in */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full relative flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-[#141419] hover:bg-[#1a1a22] text-white border border-white/15 hover:border-white/30 text-sm font-medium transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {/* Official Google Vector Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0d0d10] px-3 text-[10px] uppercase tracking-widest text-[#94949e] font-mono">
              or credentials
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Fallback: Email & Password */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#94949e]">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nickshahbaz.com"
                  className="w-full bg-[#141419] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#94949e] absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#94949e]">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141419] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-[#5a5a66] focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#94949e] absolute left-3.5 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In with Password'}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-[11px] text-[#5a5a66] font-mono">
            Protected by Supabase Auth with Row Level Security (RLS)
          </p>
        </div>
      </div>
    </div>
  );
};
