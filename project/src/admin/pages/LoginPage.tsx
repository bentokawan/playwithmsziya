import { useRef, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ADMIN_STRINGS } from '@/admin/strings';
import logoUrl from '@/assets/logo.svg';
import { signIn, useAdminSession, type SignInFailReason } from '@/lib/supabase/auth';
import styles from './LoginPage.module.css';

function messageForReason(reason: SignInFailReason): string {
  switch (reason) {
    case 'not-admin':
      return ADMIN_STRINGS.errNotAdmin;
    case 'rate-limit':
      return ADMIN_STRINGS.errRateLimit;
    case 'network':
      return ADMIN_STRINGS.errNetwork;
    case 'not-configured':
      return ADMIN_STRINGS.errNotConfigured;
    case 'invalid':
    default:
      return ADMIN_STRINGS.errInvalid;
  }
}

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith('/admin') && !raw.startsWith('/admin/login')) {
    return raw;
  }
  return '/admin';
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading: sessionLoading, session } = useAdminSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const nextPath = safeNextPath(searchParams.get('next'));

  if (!sessionLoading && session) {
    return <Navigate to={nextPath} replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    const res = await signIn(username, password);
    setSubmitting(false);

    if (res.ok) {
      navigate(nextPath, { replace: true });
      return;
    }

    setErrorMsg(messageForReason(res.reason));
    setPassword('');
    passwordRef.current?.focus();
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="admin-login-title">
        <div className={styles.header}>
          <img src={logoUrl} alt="" className={styles.logo} aria-hidden="true" />
          <h1 id="admin-login-title" className={styles.title}>
            {ADMIN_STRINGS.loginTitle}
          </h1>
        </div>

        {errorMsg && (
          <div role="alert" className={styles.alert}>
            {errorMsg}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="admin-username" className={styles.label}>
              {ADMIN_STRINGS.usernameLabel}
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              className={styles.input}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              {ADMIN_STRINGS.passwordLabel}
            </label>
            <div className={styles.passwordWrap}>
              <input
                ref={passwordRef}
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.passwordInput}`}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? ADMIN_STRINGS.hidePassword : ADMIN_STRINGS.showPassword}
                aria-pressed={showPassword}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <path d="M1 1l22 22" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={submitting} aria-busy={submitting || undefined}>
            {submitting ? ADMIN_STRINGS.signingIn : ADMIN_STRINGS.submitLogin}
          </button>
        </form>
      </section>
    </main>
  );
}
