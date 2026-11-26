import { Navigate, useLocation } from 'react-router-dom';
import { useAdminSession } from '@/lib/supabase/auth';
import { AdminLayout } from './AdminLayout';
import styles from './AdminLayout.module.css';
import { ADMIN_STRINGS } from './strings';

export function RequireAdmin() {
  const location = useLocation();
  const { loading, session, username } = useAdminSession();

  if (loading) {
    return (
      <main className={styles.unconfigured}>
        <div className={styles.card}>
          <p>{ADMIN_STRINGS.loadingSession}</p>
        </div>
      </main>
    );
  }

  if (!session || !username) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  return <AdminLayout username={username} />;
}
