/**
 * EcoSphere AI — Main Application Component
 * Orchestrates layout, navigation, and lazy-loaded feature pages.
 */

import React, { Suspense, lazy } from 'react';
import { useAppStore } from './app/store';
import { Sidebar } from './shared/components/Sidebar';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { Login } from './features/auth/Login';
import './index.css';

/* Lazy-loaded feature pages for code splitting */
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Tracker = lazy(() => import('./features/tracker/Tracker').then((m) => ({ default: m.Tracker })));
const Forecast = lazy(() => import('./features/forecast/Forecast').then((m) => ({ default: m.Forecast })));
const Simulator = lazy(() => import('./features/simulator/Simulator').then((m) => ({ default: m.Simulator })));
const Challenges = lazy(() => import('./features/challenges/Challenges').then((m) => ({ default: m.Challenges })));
const Community = lazy(() => import('./features/community/Community').then((m) => ({ default: m.Community })));
const Coach = lazy(() => import('./features/coach/Coach').then((m) => ({ default: m.Coach })));
const Reports = lazy(() => import('./features/reports/Reports').then((m) => ({ default: m.Reports })));

/* ─── Loading Fallback ─── */
const PageLoader: React.FC = () => (
  <div className="page-loader" role="status" aria-label="Loading page">
    <div className="loader-spinner" />
    <span className="sr-only">Loading...</span>
  </div>
);

/* ─── Header Bar ─── */
const Header: React.FC = () => {
  const { user, logout, darkMode, toggleDarkMode, activeSection, sidebarCollapsed } = useAppStore();

  return (
    <header
      className={`app-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      role="banner"
    >
      <div className="header-left">
        <h2 className="header-section-name">
          {getSectionTitle(activeSection)}
        </h2>
      </div>
      <div className="header-right">
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleDarkMode}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          title={`${darkMode ? 'Light' : 'Dark'} mode`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        {user && (
          <div className="header-user">
            <span className="header-user-name">{user.displayName}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

function getSectionTitle(section: string): string {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    tracker: 'Carbon Tracker',
    forecast: 'Carbon Forecast',
    simulator: 'Impact Simulator',
    challenges: 'Challenges',
    community: 'Community',
    coach: 'AI Coach',
    reports: 'Reports',
  };
  return titles[section] || 'EcoSphere AI';
}

/* ─── Active Page Renderer ─── */
const ActivePage: React.FC<{ section: string }> = ({ section }) => {
  switch (section) {
    case 'dashboard': return <Dashboard />;
    case 'tracker': return <Tracker />;
    case 'forecast': return <Forecast />;
    case 'simulator': return <Simulator />;
    case 'challenges': return <Challenges />;
    case 'community': return <Community />;
    case 'coach': return <Coach />;
    case 'reports': return <Reports />;
    default: return <Dashboard />;
  }
};

/* ─── Main App ─── */
const App: React.FC = () => {
  const { isAuthenticated, activeSection, sidebarCollapsed } = useAppStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>
      <Sidebar />
      <Header />
      <main
        className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        id="main-content"
        aria-label="Main application content"
      >
        <ErrorBoundary fallbackMessage="This section encountered an error">
          <Suspense fallback={<PageLoader />}>
            <ActivePage section={activeSection} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
