import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout';
import StatisticCard from '../../components/dashboard/StatisticCard';
import InquiryCard from '../../components/dashboard/InquiryCard';
import PropertyCard from '../../components/property/PropertyCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';

import { fetchMyProperties } from '../../services/property.service';
import {
  fetchOwnerInquiries,
  fetchInquiryStats,
} from '../../services/inquiries.service';

import './OwnerDashboard.css';

const NAV_ITEMS = [
  {
    to: '/dashboard/owner',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    to: '/owner/properties',
    label: 'My Properties',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <rect
          x="5.5"
          y="9"
          width="5"
          height="6"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    to: '/owner/properties/new',
    label: 'Add Property',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <circle
          cx="8"
          cy="8"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M8 5v6M5 8h6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/owner/inquiries',
    label: 'Inquiries',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path
          d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l3 3 3-3h3a1 1 0 001-1V3a1 1 0 00-1-1z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardSearch, setDashboardSearch] = useState('');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [pRes, iRes, sRes] = await Promise.all([
        fetchMyProperties(),
        fetchOwnerInquiries({ limit: 5 }),
        fetchInquiryStats(),
      ]);

      setProperties(pRes?.data?.properties || []);
      setInquiries(iRes?.data?.inquiries || []);
      setStats(sRes?.data || {});
    } catch (error) {
      console.error('[OwnerDashboard] Failed to load dashboard:', error);
      setLoadError(error.message || 'Unable to load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const updateScrollButton = () => setShowScrollTop(window.scrollY > 360);
    updateScrollButton();
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollButton);
  }, []);

  const propStats = {
    total: properties.length,
    available: properties.filter(
      (property) => property.status === 'available'
    ).length,
    rented: properties.filter(
      (property) => property.status === 'rented'
    ).length,
  };

  const handleStatusChange = (id, newStatus) => {
    const previousStatus = inquiries.find((inquiry) => inquiry.id === id)?.status;
    setInquiries((previous) => previous.map((inquiry) => (
      inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
    )));
    if (previousStatus && stats) {
      setStats((previous) => ({
        ...previous,
        pending: Math.max(
          0,
          (previous?.pending || 0)
          - (previousStatus === 'pending' ? 1 : 0)
          + (newStatus === 'pending' ? 1 : 0)
        ),
      }));
    }
  };

  const ownerName =
    user?.full_name?.trim() ||
    user?.name?.trim() ||
    'Property Owner';

  const ownerEmail = user?.email || 'Email not available';
  const ownerPhone = user?.phone || 'Phone not added';

  const initials = ownerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const handlePropertySearch = (event) => {
    event.preventDefault();
    const query = dashboardSearch.trim();
    if (query) {
      navigate(`/properties?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="owner">
      <div className="owner-db">
        <div className="owner-db__toolbar">
          <Link to="/" className="owner-db__brand" aria-label="Rentify home">
            <span className="owner-db__brand-mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <path d="M3 12 14 3l11 9v12H3V12Z" fill="currentColor" />
                <path d="M11 24v-8h6v8" stroke="white" strokeWidth="2" />
              </svg>
            </span>
            <span>
              <strong>Rentify</strong>
              <small>Find Your Perfect Home</small>
            </span>
          </Link>

          <form className="owner-db__search" onSubmit={handlePropertySearch}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={dashboardSearch}
              onChange={(event) => setDashboardSearch(event.target.value)}
              placeholder="Search properties, locations, or inquiries..."
              aria-label="Search properties"
            />
            <button type="submit" aria-label="Submit property search">
              Search
            </button>
          </form>

          <div className="owner-db__toolbar-actions">
            <Link
              to="/owner/inquiries"
              className="owner-db__toolbar-icon"
              aria-label={`View inquiries${stats?.pending ? `, ${stats.pending} pending` : ''}`}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 4h14v10H9l-4 3v-3H3V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              {stats?.pending > 0 && (
                <span className="owner-db__notification-count">{stats.pending}</span>
              )}
            </Link>
            <span className="owner-db__toolbar-avatar" aria-hidden="true">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                initials || 'O'
              )}
            </span>
            <span className="owner-db__toolbar-user">
              <strong>{ownerName}</strong>
              <small>Owner Account</small>
            </span>
          </div>
        </div>

        <header className="owner-db__header">
          <div>
            <div className="owner-db__eyebrow">
              Owner workspace
            </div>

            <h1 className="owner-db__title">
              Welcome back,<br />
              <span>{ownerName}!</span>
            </h1>

            <p className="owner-db__subtitle">
              Manage your properties, track inquiries and grow your rental
              business all in one place.
            </p>
          </div>

          <Link
            to="/owner/properties/new"
            className="owner-db__add-btn"
          >
            <span className="owner-db__add-icon" aria-hidden="true">+</span>
            Add New Property
          </Link>
        </header>

        {loading ? (
          <div className="owner-db__loader">
            <Loader size="md" />
          </div>
        ) : loadError ? (
          <div className="owner-db__load-error">
            <ErrorState
              type="inline"
              title="Your dashboard could not be loaded"
              description={loadError}
              onRetry={loadDashboard}
            />
          </div>
        ) : (
          <>
            {/* ── Statistics ─────────────────────────── */}
            <div className="owner-db__stats">
              <StatisticCard
                value={propStats.total}
                label="Total Properties"
                color="primary"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M3 8L10 2l7 6v10H3V8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <StatisticCard
                value={propStats.available}
                label="Available"
                color="green"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M6 10l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <StatisticCard
                value={propStats.rented}
                label="Rented"
                color="amber"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path d="M10 2a6 6 0 100 12 6 6 0 000-12ZM4 18a8 8 0 0112 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
              />

              <StatisticCard
                value={stats?.total || 0}
                label="Total Inquiries"
                color="red"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path d="M17 3H3a1 1 0 00-1 1v9a1 1 0 001 1h4l3 3 3-3h4a1 1 0 001-1V4a1 1 0 00-1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                }
              />
            </div>

            {/* ── Main dashboard layout ───────────────── */}
            <div className="owner-db__layout">
              <main className="owner-db__main">
                {/* Quick actions */}
                <div className="owner-db__quick-actions">
                  <Link
                    to="/owner/properties"
                    className="owner-db__action-card"
                  >
                    <span className="owner-db__action-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M3 9l7-6 7 6v8H3V9z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span>
                      <strong>My Properties</strong>
                      <small>
                        Manage your listings
                      </small>
                    </span>

                    <span className="owner-db__action-arrow">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/owner/properties/new"
                    className="owner-db__action-card owner-db__action-card--primary"
                  >
                    <span className="owner-db__action-icon">
                      +
                    </span>

                    <span>
                      <strong>Add Property</strong>
                      <small>
                        List a new property
                      </small>
                    </span>

                    <span className="owner-db__action-arrow">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/owner/inquiries"
                    className="owner-db__action-card"
                  >
                    <span className="owner-db__action-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M17 4H3a1 1 0 00-1 1v8a1 1 0 001 1h4l3 3 3-3h4a1 1 0 001-1V5a1 1 0 00-1-1z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>

                    <span>
                      <strong>Inquiries</strong>
                      <small>
                        Respond to renters
                      </small>
                    </span>

                    <span className="owner-db__action-arrow">
                      →
                    </span>
                  </Link>
                </div>

                {/* Recent properties */}
                <section className="owner-db__section">
                  <div className="owner-db__section-header">
                    <div>
                      <h2 className="owner-db__section-title">
                        Recent Properties
                      </h2>

                      <p className="owner-db__section-subtitle">
                        Your latest listed properties
                      </p>
                    </div>

                    <Link
                      to="/owner/properties"
                      className="owner-db__section-link"
                    >
                      View all →
                    </Link>
                  </div>

                  {properties.length === 0 ? (
                    <div className="owner-db__empty">
                      <EmptyState
                        title="No properties yet"
                        description="Add your first property and start reaching renters."
                        action={{
                          label: '+ Add your first property',
                          onClick: () => navigate('/owner/properties/new'),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="owner-db__property-grid">
                      {properties.slice(0, 4).map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent inquiries */}
                <section className="owner-db__section">
                  <div className="owner-db__section-header">
                    <div>
                      <h2 className="owner-db__section-title">
                        Recent Inquiries
                      </h2>

                      <p className="owner-db__section-subtitle">
                        Latest messages from renters
                      </p>
                    </div>

                    <Link
                      to="/owner/inquiries"
                      className="owner-db__section-link"
                    >
                      View all →
                    </Link>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="owner-db__empty">
                      <EmptyState
                        title="No inquiries yet"
                        description="Renter inquiries will appear here when someone contacts you."
                      />
                    </div>
                  ) : (
                    <div className="owner-db__inquiry-grid">
                      {inquiries.slice(0, 4).map((inquiry) => (
                        <InquiryCard
                          key={inquiry.id}
                          inquiry={inquiry}
                          viewAs="owner"
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </main>

              {/* ── Right profile panel ──────────────── */}
              <aside className="owner-db__sidebar">
                <section className="owner-db__profile-card">
                  <div className="owner-db__profile-header">
                    <h2>My Profile</h2>

                    <span className="owner-db__profile-edit">Owner account</span>
                  </div>

                  <div className="owner-db__profile-main">
                    <div className="owner-db__avatar">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={ownerName}
                        />
                      ) : (
                        initials || 'O'
                      )}
                    </div>

                    <div>
                      <h3>{ownerName}</h3>

                      <span className="owner-db__role-badge">
                        Owner
                      </span>
                    </div>
                  </div>

                  <div className="owner-db__profile-details">
                    <div className="owner-db__profile-row">
                      <span className="owner-db__profile-row-icon">
                        ✉
                      </span>

                      <span>
                        <small>Email</small>
                        <strong>{ownerEmail}</strong>
                      </span>
                    </div>

                    <div className="owner-db__profile-row">
                      <span className="owner-db__profile-row-icon">
                        ☎
                      </span>

                      <span>
                        <small>Phone</small>
                        <strong>{ownerPhone}</strong>
                      </span>
                    </div>

                    <div className="owner-db__profile-row">
                      <span className="owner-db__profile-row-icon">
                        ✓
                      </span>

                      <span>
                        <small>Account</small>
                        <strong>Active Owner</strong>
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/owner/properties"
                    className="owner-db__profile-btn"
                  >
                    Manage properties
                  </Link>
                </section>

                {/* Quick information */}
                <section className="owner-db__side-card">
                  <div className="owner-db__side-card-title">
                    <span className="owner-db__side-card-icon">
                      ⚡
                    </span>
                    Quick overview
                  </div>

                  <div className="owner-db__overview-list">
                    <div>
                      <span>Available listings</span>
                      <strong>{propStats.available}</strong>
                    </div>

                    <div>
                      <span>Rented properties</span>
                      <strong>{propStats.rented}</strong>
                    </div>

                    <div>
                      <span>Pending inquiries</span>
                      <strong>{stats?.pending || 0}</strong>
                    </div>
                  </div>
                </section>

                {/* Help card */}
                <section className="owner-db__help-card">
                  <div className="owner-db__help-icon">
                    ?
                  </div>

                  <h3>Need help?</h3>

                  <p>
                    Manage your listings and respond to renters
                    easily from Rentify.
                  </p>

                  <Link
                    to="/owner/inquiries"
                    className="owner-db__help-link"
                  >
                    View inquiries →
                  </Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
      {showScrollTop && (
        <button
          type="button"
          className="owner-db__scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 14 6-6 6 6" />
          </svg>
        </button>
      )}
    </DashboardLayout>
  );
};

export default OwnerDashboard;