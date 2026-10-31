import { useState, useEffect } from 'react';
import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import { Magnetic } from './components/common/Magnetic';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import {
  ArrowDown,
  ArrowUp,
  Sparkles,
  Layers,
  Activity,
  Zap,
  MousePointer2,
  CheckCircle2,
} from 'lucide-react';

function MotionTesterControls() {
  const { scrollTo } = useSmoothScroll();
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(Math.round(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0f0f13]/90 backdrop-blur-md border border-[#e50914]/30 px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(229,9,20,0.25)]">
      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase tracking-wider text-[#94949e] font-semibold">Scroll Velocity Y</span>
        <span className="text-xs font-mono font-bold text-[#ff1e27]">{scrollPos}px</span>
      </div>
      <div className="h-6 w-[1px] bg-white/10" />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => scrollTo('#deep-section', { duration: 1.5 })}
          icon={<ArrowDown className="w-3.5 h-3.5" />}
        >
          To Bottom
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => scrollTo(0, { duration: 1.5 })}
          icon={<ArrowUp className="w-3.5 h-3.5" />}
        >
          Top
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SmoothScroll>
      <div className="min-h-[300vh] bg-[#08080a] text-white bg-grid-pattern crimson-ambient flex flex-col items-center justify-start p-8 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-[#e50914]/20 blur-[100px] pointer-events-none rounded-full" />

        {/* Floating Interactive Controls */}
        <MotionTesterControls />

        {/* Section 1: Hero & Verification Header */}
        <section className="max-w-xl mx-auto space-y-6 relative z-10 pt-20 min-h-[90vh] flex flex-col justify-center items-center">
          <div className="flex justify-center gap-2">
            <Badge variant="crimson" dot>Issue #7 Testing Sandbox</Badge>
            <Badge variant="emerald" dot>Lenis Active</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Lenis Inertia & Motion Synchronization
          </h1>

          <p className="text-[#94949e] text-base leading-relaxed">
            Test and evaluate the smooth momentum scroll physics, slim reactive crimson progress bar, and Framer Motion integration below.
          </p>

          <Card className="text-left mt-4 w-full">
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                <Activity className="w-4 h-4" />
              </span>
              <span className="text-sm font-bold text-white">Acceptance Criteria Checklist</span>
            </div>
            <ul className="text-xs text-[#94949e] space-y-1.5 pl-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff1e27]" />
                Butter-smooth momentum scrolling (wheel, trackpad, programmatic)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff1e27]" />
                Synchronized Framer Motion hooks with spring dampening
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff1e27]" />
                Slim crimson top scroll indicator with glow gradient
              </li>
            </ul>
          </Card>

          <div className="pt-2 flex justify-center">
            <Magnetic>
              <Button
                variant="primary"
                icon={<ArrowDown className="w-4 h-4" />}
                onClick={() => {
                  const elem = document.getElementById('test-milestone-2');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Scroll to Test Bench
              </Button>
            </Magnetic>
          </div>
        </section>

        {/* Section 2: Milestone 2 Bench */}
        <section id="test-milestone-2" className="max-w-3xl mx-auto w-full py-32 space-y-8 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="crimson">Checkpoint A</Badge>
            <span className="text-xs text-[#94949e]">Midpoint Scroll Synchronization</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Momentum Physics & Easing Benchmark
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">Exponential Easing</span>
              </div>
              <p className="text-xs text-[#94949e]">
                Utilizes <code className="text-white bg-black/40 px-1 py-0.5 rounded">1.001 - 2^(-10t)</code> for instant responsiveness with a natural, decelerating tail.
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">Spring-Dampted Indicator</span>
              </div>
              <p className="text-xs text-[#94949e]">
                The top crimson progress bar uses <code className="text-white bg-black/40 px-1 py-0.5 rounded">useSpring(scrollYProgress)</code> with stiffness: 100, damping: 30.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3: Deep Scroll & Programmatic Navigation */}
        <section id="deep-section" className="max-w-3xl mx-auto w-full py-36 space-y-8 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="crimson">Checkpoint B</Badge>
            <span className="text-xs text-[#94949e]">Deep Viewport Target (100% Progress)</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Targeted Smooth Scroll Complete
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <MousePointer2 className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">Hardware Accelerated</span>
              </div>
              <p className="text-xs text-[#94949e]">
                Zero jank or layout reflows during fast mouse wheel scrolling or touch gestures.
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-[#e50914]/10 text-[#ff1e27] border border-[#e50914]/20">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white">3D Ready Architecture</span>
              </div>
              <p className="text-xs text-[#94949e]">
                Hooks are fully exposed to feed scroll velocity directly into Three.js camera rigs in Issue #8.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
}
