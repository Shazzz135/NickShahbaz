import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { Badge } from './components/common/Badge';
import { Button } from './components/common/Button';
import { Magnetic } from './components/common/Magnetic';
import { ArrowRight, Lock } from 'lucide-react';

// Code-split 3D canvas and admin routes so entry bundle stays lightweight and fast
const CanvasBackground = lazy(() =>
  import('./components/3d/CanvasBackground').then((m) => ({ default: m.CanvasBackground }))
);
const AdminLogin = lazy(() =>
  import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function PublicPortfolio() {
  return (
    <SmoothScroll>
      <Suspense fallback={null}>
        <CanvasBackground />
      </Suspense>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <div className="flex justify-center gap-2">
            <Badge variant="crimson" dot>Nick Shahbaz</Badge>
            <Badge variant="emerald" dot>In Development</Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Application Developer
          </h1>
          <p className="text-[#94949e] text-lg leading-relaxed">
            High-end architecture, interactive 3D experiences, and robust cloud services.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Magnetic>
              <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Coming Soon
              </Button>
            </Magnetic>
            <Magnetic>
              <a href="/admin/login">
                <Button variant="outline" icon={<Lock className="w-4 h-4" />}>
                  Admin Portal
                </Button>
              </a>
            </Magnetic>
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-[#08080a]" />}>
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<PublicPortfolio />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
