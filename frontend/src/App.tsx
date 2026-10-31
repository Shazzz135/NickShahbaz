import { Button } from './components/common/Button';
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import { Magnetic } from './components/common/Magnetic';
import { ArrowRight, Terminal } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white bg-grid-pattern crimson-ambient flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-[#e50914]/20 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
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

        <Card className="text-left mt-6">
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
    </div>
  );
}
