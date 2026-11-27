import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAdminSession } from '@/lib/supabase/auth';
import { AdminLayout } from './AdminLayout';
import { ADMIN_STRINGS } from './strings';

export function RequireAdmin() {
  const location = useLocation();
  const { loading, session, username } = useAdminSession();

  if (loading) {
    return (
      <LoadingState
        variant="page"
        withBackdrop={false}
        showMascot={false}
        message={ADMIN_STRINGS.loadingSession}
      />
    );
  }

  if (!session || !username) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  return <AdminLayout username={username} />;
}
