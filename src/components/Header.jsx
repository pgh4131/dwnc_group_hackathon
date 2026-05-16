export default function Header({ copy }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={`${copy.serviceName} 홈`}>
        <span className="brand-mark">CB</span>
        <span>{copy.serviceName}</span>
      </a>

      <nav className="main-nav" aria-label="주요 메뉴">
        {copy.navigation.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

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
