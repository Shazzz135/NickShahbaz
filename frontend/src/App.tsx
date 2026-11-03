import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { Preloader } from './components/layout/Preloader';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ProjectGallery } from './components/sections/ProjectGallery';
import { ExperienceTimeline } from './components/sections/ExperienceTimeline';
import { useSiteMeta } from './hooks/useSiteMeta';
import { useAboutMeta } from './hooks/useAboutMeta';
import { useProjects } from './hooks/useProjects';
import { useExperiences } from './hooks/useExperiences';
import { useDynamicFavicon } from './hooks/useDynamicFavicon';
import { DEFAULT_HERO_META, type HeroMetaConfig } from './types/siteMeta';

// Code-split 3D canvas, contact section, and admin routes so entry bundle stays lightweight and fast
const CanvasBackground = lazy(() =>
  import('./components/3d/CanvasBackground').then((m) => ({ default: m.CanvasBackground }))
);
const ContactSection = lazy(() =>
  import('./components/sections/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const AdminLogin = lazy(() =>
  import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function GlobalBranding() {
  const { data: rawHeroData } = useSiteMeta('hero', DEFAULT_HERO_META);
  const hero = { ...DEFAULT_HERO_META, ...rawHeroData } as HeroMetaConfig;
  useDynamicFavicon(hero.browserIconUrl);
  return null;
}

function PublicPortfolio() {
  const { loading: heroLoading } = useSiteMeta('hero', DEFAULT_HERO_META);
  const { loading: aboutLoading } = useAboutMeta();
  const { loading: projectsLoading } = useProjects();
  const { loading: experiencesLoading } = useExperiences();

  // All primary database tables must be resolved before revealing content
  const isDataReady = !heroLoading && !aboutLoading && !projectsLoading && !experiencesLoading;

  return (
    <>
      {/* Interactive Cyber-Preloader with Shutter Exit */}
      <Preloader isReady={isDataReady} />

      <SmoothScroll>
        <Suspense fallback={null}>
          <CanvasBackground />
        </Suspense>

        <div>
          {/* 1. Dynamic Hero Section with 3D Foreground Elements */}
          <HeroSection />

          {/* 2. About Me, Skills Matrix & Philosophy */}
          <AboutSection />

          {/* 3. Application Development Project Gallery & Detail Modals */}
          <ProjectGallery />

          {/* 4. Experience & Career Interactive Timeline */}
          <ExperienceTimeline />

          {/* 5. Contact & Collaboration Section */}
          <Suspense fallback={<div className="w-full min-h-[400px]" />}>
            <ContactSection />
          </Suspense>
        </div>
      </SmoothScroll>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalBranding />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-[#08080a]" />}>
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<PublicPortfolio />} />

            {/* Admin Login & Fallbacks */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
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
