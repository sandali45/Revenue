import { useState } from 'react';
import { clearToken, getToken } from './api.js';
import LoginPage from './components/LoginPage.jsx';
import Layout from './components/Layout.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import EarningsPage from './pages/EarningsPage.jsx';
import SettlementsPage from './pages/SettlementsPage.jsx';
import CommissionPage from './pages/CommissionPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

const pages = {
  overview: OverviewPage,
  earnings: EarningsPage,
  settlements: SettlementsPage,
  commission: CommissionPage,
  reports: ReportsPage,
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [activePage, setActivePage] = useState('overview');

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  const Page = pages[activePage];

  function logout() {
    clearToken();
    setAuthenticated(false);
  }

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={logout}
    >
      <Page />
    </Layout>
  );
}
