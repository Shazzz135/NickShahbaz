import { lazy, Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { Badge } from './components/common/Badge';
import { Button } from './components/common/Button';
import { Magnetic } from './components/common/Magnetic';

// Lazy-load the WebGL layer so Three.js ships in its own chunk and never blocks first paint
const CanvasBackground = lazy(() =>
  import('./components/3d/CanvasBackground').then((m) => ({ default: m.CanvasBackground }))
);

export default function App() {
  return (
    <SmoothScroll>
      <Suspense fallback={null}>
        <CanvasBackground />
      </Suspense>

      {/* Placeholder shell — replaced by real sections in Milestone 5 */}
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
          <div className="pt-2 flex justify-center">
            <Magnetic>
              <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Coming Soon
              </Button>
            </Magnetic>
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}
