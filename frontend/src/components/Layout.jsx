const navigation = [
  ['overview', 'Overview'],
  ['earnings', 'Earnings'],
  ['settlements', 'Settlements'],
  ['commission', 'Commission'],
  ['reports', 'Reports'],
];

export default function Layout({ activePage, onNavigate, onLogout, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/itx-logo.png" alt="ITX Digital Services" />
          <div>
            <strong>Revenue</strong>
            <span>Management</span>
          </div>
        </div>

        <nav>
          {navigation.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={activePage === id ? 'nav-item active' : 'nav-item'}
              onClick={() => onNavigate(id)}
            >
              <span className="nav-dot" />
              {label}
            </button>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={onLogout}>
          Sign out
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">ITX Digital Services</p>
            <h1>{navigation.find(([id]) => id === activePage)?.[1]}</h1>
          </div>
          <div className="admin-chip">
            <span className="avatar">A</span>
            <div>
              <strong>Admin</strong>
              <span>Revenue access</span>
            </div>
          </div>
        </header>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
