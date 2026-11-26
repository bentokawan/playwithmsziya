import { domAnimation, LazyMotion } from 'motion/react';
import { BrowserRouter } from 'react-router-dom';
import { ContentProvider } from '@/lib/content/ContentProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { AudioProvider } from './providers/AudioProvider';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <PreferencesProvider>
      <ErrorBoundary>
        <ContentProvider>
          <AudioProvider>
            <LazyMotion features={domAnimation} strict>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </LazyMotion>
          </AudioProvider>
        </ContentProvider>
      </ErrorBoundary>
    </PreferencesProvider>
  );
}
