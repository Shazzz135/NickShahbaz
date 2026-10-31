import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import { Magnetic } from './components/common/Magnetic';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { ArrowRight, Terminal, Sparkles, Layers, Cpu } from 'lucide-react';

export default function App() {
  return (
    <SmoothScroll>
      <div className="min-h-[220vh] bg-[#08080a] text-white bg-grid-pattern crimson-ambient flex flex-col items-center justify-start p-8 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-[#e50914]/20 blur-[100px] pointer-events-none rounded-full" />

        {/* Hero Preview Section */}
        <div className="max-w-xl mx-auto space-y-6 relative z-10 pt-24 min-h-[90vh] flex flex-col justify-center items-center">
          <div className="flex justify-center gap-2">
            <Badge variant="crimson" dot>Nick Shahbaz</Badge>
            <Badge variant="emerald" dot>Core Ready</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Application Developer
          </h1>

          <p className="text-[#94949e] text-base leading-relaxed">
            High-end architecture, interactive 3D WebGL experiences, and robust cloud services.
          </p>

          <Card className="text-left mt-6 w-full">
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                <Terminal className="w-4 h-4" />
              </span>
              <span className="text-sm font-bold text-white">Foundations Online</span>
            </div>
            <p className="text-xs text-[#94949e]">
              Tailwind CSS v4 design system, Crimson/Dark/White tokens, and motion primitives established.
            </p>
          </Card>

          <div className="pt-4 flex justify-center">
            <Magnetic>
              <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Explore Platform
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* Scroll Momentum Verification Section */}
        <div className="max-w-2xl mx-auto w-full py-24 space-y-8 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="crimson">Smooth Motion</Badge>
            <span className="text-xs text-[#94949e]">Lenis Inertia + Framer Motion Hooks</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Inertia Scroll & Synchronized Progress
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">Momentum Physics</span>
              </div>
              <p className="text-xs text-[#94949e]">
                Customized exponential dampening curve providing butter-smooth velocity synchronization.
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">Crimson Indicator</span>
              </div>
              <p className="text-xs text-[#94949e]">
                Slim reactive crimson glow indicator pegged directly to spring-interpolated scroll state.
              </p>
            </Card>

            <Card className="md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <Cpu className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">Global Motion Architecture</span>
              </div>
              <p className="text-xs text-[#94949e]">
                Centralized LenisContext & useSmoothScroll hooks to drive future 3D canvas and scroll triggers seamlessly.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
}
