import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from '@/lib/supabase/auth';
import styles from './AdminLayout.module.css';
import { ADMIN_STRINGS } from './strings';

const NAV_ITEMS = [
  { to: '/admin', label: ADMIN_STRINGS.navDashboard, end: true },
  { to: '/admin/objek', label: ADMIN_STRINGS.navObjects, end: false },
  { to: '/admin/kata', label: ADMIN_STRINGS.navWords, end: false },
  { to: '/admin/hijaiyyah', label: ADMIN_STRINGS.navHijaiyyah, end: false },
  { to: '/admin/suara', label: ADMIN_STRINGS.navAudio, end: false },
  { to: '/admin/terbitkan', label: ADMIN_STRINGS.navPublish, end: false },
] as const;

export function AdminLayout({ username }: { readonly username: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <h2 className={styles.brand}>{ADMIN_STRINGS.brandAdmin}</h2>
        <nav className={styles.navList} aria-label={ADMIN_STRINGS.brandAdmin}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <span className={styles.user}>{username}</span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            {ADMIN_STRINGS.logout}
          </button>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
