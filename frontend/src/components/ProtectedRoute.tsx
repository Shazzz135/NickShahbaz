import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
        <Badge variant="crimson" dot>Verifying Administrator Privileges</Badge>
      </div>
    );
  }

  // Not signed in at all
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Signed in, but not the authorized administrator
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white bg-grid-pattern crimson-ambient flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 border-red-500/30 bg-[#0d0d10]/95 space-y-6">
          <div className="flex justify-center">
            <span className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-[#ff1e27]">
              <ShieldAlert className="w-8 h-8" />
            </span>
          </div>

          <div className="space-y-2">
            <Badge variant="crimson" dot>Access Denied</Badge>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Unauthorized Account
            </h2>
            <p className="text-xs text-[#94949e] leading-relaxed">
              You are signed in as <span className="text-white font-mono">{user.email}</span>, which is not authorized to manage this website.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="primary"
              icon={<LogOut className="w-4 h-4" />}
              onClick={() => signOut()}
            >
              Sign Out & Switch Account
            </Button>
            <a href="/">
              <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} className="w-full">
                Return to Public Portfolio
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
