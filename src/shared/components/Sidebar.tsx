/**
 * Sidebar navigation component with collapsible design,
 * active state indicators, and sustainability branding.
 */

import React from 'react';
import { useAppStore } from '../../app/store';
import { USER_TIERS } from '../../shared/constants';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Understand',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'forecast', label: 'Forecast', icon: '📈' },
      { id: 'reports', label: 'Reports', icon: '📄' },
    ],
  },
  {
    title: 'Track',
    items: [
      { id: 'tracker', label: 'Carbon Tracker', icon: '🌍' },
    ],
  },
  {
    title: 'Reduce',
    items: [
      { id: 'coach', label: 'AI Coach', icon: '🤖' },
      { id: 'simulator', label: 'Impact Simulator', icon: '🔬' },
      { id: 'challenges', label: 'Challenges', icon: '🏆' },
      { id: 'community', label: 'Community', icon: '👥' },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, sidebarCollapsed, toggleSidebar, user } = useAppStore();
  const tierInfo = user ? USER_TIERS[user.tier] : null;

  return (
    <nav
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          <span className="logo-icon">🌿</span>
          {!sidebarCollapsed && <span className="logo-text">EcoSphere AI</span>}
        </div>
        <button
          className="sidebar-toggle btn-ghost btn-icon"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="sidebar-nav-container">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title} className="sidebar-section">
            {idx > 0 && sidebarCollapsed && <hr className="sidebar-divider" />}
            {!sidebarCollapsed && (
              <div className="sidebar-section-header">{section.title}</div>
            )}
            <ul className="sidebar-nav" role="menubar">
              {section.items.map((item) => (
                <li key={item.id} role="none">
                  <button
                    role="menuitem"
                    className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                    title={item.label}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                    {activeSection === item.id && <span className="nav-indicator" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User Profile */}
      {user && !sidebarCollapsed && (
        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar">
            {tierInfo?.icon ?? '🌱'}
          </div>
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{user.displayName}</span>
            <span className="sidebar-profile-tier" style={{ color: tierInfo?.color }}>
              {tierInfo?.label} • Score {user.sustainabilityScore}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};
