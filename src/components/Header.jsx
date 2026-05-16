import { Link } from 'react-router-dom';

export default function Header({
  copy,
  isAuthenticated = false,
  userEmail = '',
  onLoginClick,
  onLogoutClick,
  extraHeaderActions = null,
}) {
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
      ) : (
        <div className="header-nav-spacer" aria-hidden="true" />
      )}

      <div className="header-actions">
        {isAuthenticated && userEmail ? <span className="header-user">{userEmail}</span> : null}
        {copy.headerActions.map((action) => {
          if (action.type === 'auth') {
            return isAuthenticated ? (
              <button
                key="logout"
                className={`button button-${action.variant}`}
                type="button"
                onClick={onLogoutClick}
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

          return (
            <Link key={action.href} className={`button button-${action.variant}`} to={action.href}>
              {action.label}
            </Link>
          );
        })}
        {extraHeaderActions}
      </div>
    </header>
  );
}
