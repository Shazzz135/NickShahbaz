import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { Preloader } from './components/layout/Preloader';
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
  const [isSceneReady, setIsSceneReady] = useState(false);

  return (
    <>
      {/* Interactive Cyber-Preloader with Shutter Exit */}
      <Preloader onComplete={() => setIsSceneReady(true)} />

      <SmoothScroll>
        <Suspense fallback={null}>
          <CanvasBackground />
        </Suspense>

        <motion.main
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isSceneReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6"
        >
          <div className="max-w-2xl text-center space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isSceneReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center gap-2 flex-wrap"
            >
              <Badge variant="crimson" dot>Nick Shahbaz</Badge>
              <Badge variant="emerald" dot>Available for Select Contracts</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isSceneReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
            >
              Application Developer
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isSceneReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-[#94949e] text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
            >
              Architecting distributed web and mobile platforms, interactive 3D WebGL experiences, and robust cloud services.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isSceneReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <Magnetic>
                <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Engineering
                </Button>
              </Magnetic>
              <Magnetic>
                <a href="/admin/login">
                  <Button variant="outline" icon={<Lock className="w-4 h-4" />}>
                    Admin Portal
                  </Button>
                </a>
              </Magnetic>
            </motion.div>
          </div>
        </motion.main>
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
