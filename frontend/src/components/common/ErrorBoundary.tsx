import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkLoadError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-6 text-center">
          <Card className="max-w-md p-8 border-red-500/30 bg-[#0d0d10]/95 space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <span className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-[#ff1e27]">
                <AlertTriangle className="w-8 h-8" />
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isChunkLoadError ? 'Module Load Interrupted' : 'Application Exception'}
              </h2>
              <p className="text-xs text-[#94949e] leading-relaxed">
                {isChunkLoadError
                  ? 'A deployment update or browser extension blocked a required module. Reloading resolves cached bundles.'
                  : (this.state.error?.message || 'An unexpected error occurred while rendering this interface.')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleReload}
                className="w-full"
              >
                Reload Interface
              </Button>
              <Button
                variant="ghost"
                icon={<Home className="w-4 h-4" />}
                onClick={this.handleGoHome}
                className="w-full"
              >
                Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
