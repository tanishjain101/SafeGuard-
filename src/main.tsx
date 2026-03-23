import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application render error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-red-50 text-red-900 p-6 font-mono text-sm">
            <h1 className="text-lg font-bold mb-2">App crashed while rendering</h1>
            <p className="mb-3">Open DevTools Console for full details.</p>
            <pre className="whitespace-pre-wrap break-words">{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element (#root) not found in index.html');
}

const root = createRoot(rootElement);
const bootWindow = window as Window & { __APP_BOOTSTRAPPED__?: boolean };

const renderFatal = (message: string, details?: string) => {
  bootWindow.__APP_BOOTSTRAPPED__ = false;
  root.render(
    <div className="min-h-screen bg-red-50 text-red-900 p-6 font-mono text-sm">
      <h1 className="text-lg font-bold mb-2">App failed to start</h1>
      <p className="mb-3">{message}</p>
      {details && <pre className="whitespace-pre-wrap break-words">{details}</pre>}
    </div>
  );
};

window.addEventListener('error', (event) => {
  console.error('Global runtime error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const bootstrap = async () => {
  try {
    const appModule = await import('./App.tsx');
    const App = appModule.default;
    bootWindow.__APP_BOOTSTRAPPED__ = true;

    root.render(
      <StrictMode>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    bootWindow.__APP_BOOTSTRAPPED__ = false;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const cacheHint = message.includes('Failed to fetch dynamically imported module')
      ? '\n\nTry a hard refresh (Cmd+Shift+R) or clear site data/service worker.'
      : '';

    console.error('Fatal bootstrap error:', error);
    renderFatal(`Bootstrap error: ${message}${cacheHint}`, stack);
  }
};

void bootstrap();
