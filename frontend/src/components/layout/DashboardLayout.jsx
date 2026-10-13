import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

/**
 * DashboardLayout
 * navItems: [{ to, label, icon }]
 * role: 'owner' | 'renter'
 * children: page content
 */
const DashboardLayout = ({ navItems = [], role, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const sidebar = (
    <aside className="db-sidebar" aria-label="Dashboard navigation">
      {/* Brand */}
      <div className="db-sidebar__brand">
        <Link to="/" className="db-sidebar__logo" aria-label="Rentify home">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M4 11.5L14 4l10 7.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
              fill="var(--color-primary-500)" stroke="var(--color-primary-500)"
              strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="10" y="16" width="8" height="9" rx="1"
              fill="var(--color-secondary-500)" stroke="var(--color-secondary-500)" strokeWidth="1"/>
          </svg>
          <span className="db-sidebar__logo-text">Rentify</span>
        </Link>
      </div>

      {/* User info */}
      <div className="db-sidebar__user">
        <div className="db-sidebar__avatar" aria-hidden="true">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" />
            : <span>{initials}</span>
          }
        </div>
        <div className="db-sidebar__user-info">
          <p className="db-sidebar__user-name">{user?.full_name || 'User'}</p>
          <span className={`badge ${role === 'owner' ? 'badge-primary' : 'badge-secondary'}`}
            style={{ textTransform: 'capitalize' }}>
            {role}
          </span>
        </div>
      </div>

      <div className="db-sidebar__divider" />

      {/* Nav links */}
      <nav className="db-sidebar__nav" aria-label="Dashboard sections">
        <ul className="db-sidebar__nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `db-nav-item ${isActive ? 'db-nav-item--active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon && (
                  <span className="db-nav-item__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="db-nav-item__label">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="db-nav-item__badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="db-sidebar__spacer" />

      {/* Bottom actions */}
      <div className="db-sidebar__bottom">
        <button className="db-sidebar__logout" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l4-3-4-3M14 8H6"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="dashboard-layout">
      {/* Mobile topbar */}
      <header className="db-topbar">
        <button
          className="db-topbar__menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          aria-expanded={sidebarOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <Link to="/" className="db-topbar__brand">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M4 11.5L14 4l10 7.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
              fill="var(--color-primary-500)" stroke="var(--color-primary-500)"
              strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="10" y="16" width="8" height="9" rx="1"
              fill="var(--color-secondary-500)" stroke="var(--color-secondary-500)" strokeWidth="1"/>
          </svg>
          <span>Rentify</span>
        </Link>
        <div className="db-topbar__avatar" aria-hidden="true">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" />
            : <span>{initials}</span>
          }
        </div>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="db-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <div className={`db-sidebar-wrap ${sidebarOpen ? 'db-sidebar-wrap--open' : ''}`}>
        {sidebar}
      </div>

      {/* Main content */}
      <main className="db-main" id="main-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
