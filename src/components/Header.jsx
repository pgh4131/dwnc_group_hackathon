export default function Header({
  copy,
  isAuthenticated = false,
  userEmail = '',
  accountType = null,
  onLoginClick,
  onLogoutClick,
  onStartupClick,
}) {
  const navigationItems = isAuthenticated
    ? [...copy.navigation, ...copy.authenticatedNavigation]
    : copy.navigation;

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={`${copy.serviceName} 홈`}>
        <span className="brand-mark">CB</span>
        <span>{copy.serviceName}</span>
      </a>

      {navigationItems.length > 0 ? (
        <nav className="main-nav" aria-label="주요 메뉴">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : (
        <div />
      )}

      <div className="header-actions">
        {isAuthenticated && userEmail ? <span className="header-user">{userEmail}</span> : null}
        {isAuthenticated ? (
          <a className="button button-secondary" href="/clubs/dashboard">
            {copy.auth.dashboardLabel}
          </a>
        ) : null}
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

          if (action.type === 'startup') {
            return (
              <button
                key={action.type}
                className={`button button-${action.variant}`}
                type="button"
                onClick={onStartupClick}
                aria-label={
                  accountType === 'startup' ? action.label : copy.auth.startupOnlyMessage
                }
              >
                {action.label}
              </button>
            );
          }

          return (
            <a key={action.href} className={`button button-${action.variant}`} href={action.href}>
              {action.label}
            </a>
          );
        })}
      </div>
    </header>
  );
}
