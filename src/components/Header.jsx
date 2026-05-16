import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentSession, getAccountType, signOut, subscribeToAuthChanges } from '../services/auth.js';

export default function Header({
  copy,
  isAuthenticated: initialIsAuth = false,
  userEmail: initialEmail = '',
  accountType: initialAccountType = null,
  onLoginClick = () => {},
  onLogoutClick,
  onStartupClick,
  extraHeaderActions = null,
  hideDashboardButton = false,
}) {
  const [session, setSession] = useState(null);
  const [fetchedAccountType, setFetchedAccountType] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { session: currentSession } = await getCurrentSession();
      if (isMounted && currentSession) {
        setSession(currentSession);
        setFetchedAccountType(await getAccountType(currentSession));
      }
    }
    load();
    const unsub = subscribeToAuthChanges(async (newSession) => {
      setSession(newSession);
      setFetchedAccountType(await getAccountType(newSession));
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const isAuthenticated = session ? true : initialIsAuth;
  const userEmail = session?.user?.email || initialEmail;
  const accountType = fetchedAccountType || initialAccountType;

  const handleLogoutClick = async () => {
    try {
      if (onLogoutClick) {
        await onLogoutClick();
      } else {
        await signOut();
        window.location.href = '/';
      }
    } finally {
      setSession(null);
      setFetchedAccountType(null);
    }
  };

  const navigationItems = isAuthenticated
    ? [...copy.navigation, ...copy.authenticatedNavigation]
    : copy.navigation;

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label={`${copy.serviceName} 홈`}>
        <span className="brand-mark">CB</span>
        <span>{copy.serviceName}</span>
      </Link>

      {navigationItems.length > 0 ? (
        <nav className="main-nav" aria-label="주요 메뉴">
          {navigationItems.map((item) => (
            <Link key={item.href} to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="header-actions">
        {isAuthenticated && userEmail ? (
          <span className="header-user">{userEmail}</span>
        ) : null}

        {isAuthenticated && !hideDashboardButton && accountType !== 'startup' ? (
          <Link className="button button-secondary" to="/dashboard/student">
            {copy.auth.dashboardLabel}
          </Link>
        ) : null}

        {copy.headerActions.map((action) => {
          if (action.type === 'startup' && accountType === 'startup') {
            return (
              <Link
                key="startup-dashboard"
                className="button button-primary"
                to="/dashboard/company"
              >
                스타트업 대시보드
              </Link>
            );
          }

          if (action.type === 'auth') {
            return isAuthenticated ? (
              <button
                key="logout"
                className={`button button-${action.variant}`}
                type="button"
                onClick={handleLogoutClick}
              >
                {copy.auth.logoutLabel}
              </button>
            ) : (
              <button
                key={action.type}
                className={`button button-${action.variant}`}
                type="button"
                onClick={onLoginClick}
              >
                {action.label}
              </button>
            );
          }

          if (action.type === 'startup') {
            return onStartupClick ? (
              <button
                key={action.type}
                className={`button button-${action.variant}`}
                type="button"
                onClick={onStartupClick}
                aria-label={
                  !isAuthenticated
                    ? copy.auth.loginRequiredMessage
                    : accountType === 'startup'
                    ? action.label
                    : copy.auth.startupOnlyMessage
                }
              >
                {action.label}
              </button>
            ) : (
              <Link
                key={action.href}
                className={`button button-${action.variant}`}
                to={action.href}
              >
                {action.label}
              </Link>
            );
          }

          return (
            <Link
              key={action.href}
              className={`button button-${action.variant}`}
              to={action.href}
            >
              {action.label}
            </Link>
          );
        })}

        {extraHeaderActions}
      </div>
    </header>
  );
}
