import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { Preloader } from './components/layout/Preloader';
import { HeroSection } from './components/sections/HeroSection';
import { ProjectGallery } from './components/sections/ProjectGallery';

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
  const [isSceneReady, setIsSceneReady] = useState(false);

  return (
    <>
      {/* Interactive Cyber-Preloader with Shutter Exit */}
      <Preloader onComplete={() => setIsSceneReady(true)} />

      <SmoothScroll>
        <Suspense fallback={null}>
          <CanvasBackground />
        </Suspense>

        {/* Dynamic Hero Section with 3D Foreground Elements */}
        <HeroSection isSceneReady={isSceneReady} />

        {/* Application Development Project Gallery & Detail Modals */}
        <ProjectGallery />
      </SmoothScroll>
    </>
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
