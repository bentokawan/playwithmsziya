import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAudio } from '@/app/providers/useAudio';
import { readEnv } from '@/lib/env';
import styles from './AdminLayout.module.css';
import { AudioPage } from './pages/AudioPage';
import { DashboardPage } from './pages/DashboardPage';
import { HijaiyyahPage } from './pages/HijaiyyahPage';
import { LoginPage } from './pages/LoginPage';
import { ObjectsPage } from './pages/ObjectsPage';
import { PublishPage } from './pages/PublishPage';
import { WordsPage } from './pages/WordsPage';
import { RequireAdmin } from './RequireAdmin';
import { ADMIN_STRINGS } from './strings';

function getMissingEnvVars(): string[] {
  const env = readEnv();
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (!env.contentBaseUrl) missing.push('VITE_CONTENT_BASE_URL');
  if (!env.adminEmailDomain) missing.push('VITE_ADMIN_EMAIL_DOMAIN');
  return missing;
}

export default function AdminRoutes() {
  const audio = useAudio();

  useEffect(() => {
    audio.setScene({ music: null, ambient: null });
  }, [audio]);

  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    return (
      <main className={styles.unconfigured}>
        <section className={styles.card}>
          <h1>{ADMIN_STRINGS.errNotConfigured}</h1>
          <p>{ADMIN_STRINGS.missingEnvHelp}</p>
          <ul>
            {missing.map((v) => (
              <li key={v}>
                <code>{v}</code>
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route index element={<DashboardPage />} />
        <Route path="objek" element={<ObjectsPage />} />
        <Route path="kata" element={<WordsPage />} />
        <Route path="hijaiyyah" element={<HijaiyyahPage />} />
        <Route path="suara" element={<AudioPage />} />
        <Route path="terbitkan" element={<PublishPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
