export default function Header({ copy, isAuthenticated = false }) {
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
        {copy.headerActions.map((action) => (
          <a key={action.href} className={`button button-${action.variant}`} href={action.href}>
            {action.label}
          </a>
        ))}
      </div>
    </header>
  );
}
