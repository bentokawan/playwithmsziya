import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useT } from '@/i18n/useT';

function ErrorFallback({ onRetry }: { readonly onRetry: () => void }) {
  const t = useT();
  return (
    <main style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h1>{t('error.title')}</h1>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
        <button type="button" onClick={onRetry}>
          {t('error.retry')}
        </button>
        <a href="/home">{t('nav.home')}</a>
      </div>
    </main>
  );
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<{ readonly children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  private readonly handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
