import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout';
import StatisticCard from '../../components/dashboard/StatisticCard';
import InquiryCard from '../../components/dashboard/InquiryCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import RenterWorkspaceHeader from './RenterWorkspaceHeader';

import { fetchFavorites } from '../../services/favorites.service';
import { fetchMyInquiries } from '../../services/inquiries.service';

import './RenterPages.css';
import './RenterDashboard.css';

const NAV_ITEMS = [
  {
    to: '/dashboard/renter',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    to: '/properties',
    label: 'Explore Homes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/renter/favorites',
    label: 'Saved Properties',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 13.5S1.5 9.4 1.5 5.5a3.5 3.5 0 017-1 3.5 3.5 0 017 1C15.5 9.4 8 13.5 8 13.5z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    to: '/renter/inquiries',
    label: 'My Inquiries',
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
  { to: '/renter/profile', label: 'My Profile' },
];

const RenterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [fRes, iRes] = await Promise.all([
        fetchFavorites(),
        fetchMyInquiries(),
      ]);

      setFavorites(fRes?.data?.favorites || []);
      setInquiries(iRes?.data?.inquiries || []);
    } catch (error) {
      console.error('[RenterDashboard] Failed to load dashboard:', error);
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

  const pending = inquiries.filter(
    (inquiry) => inquiry.status === 'pending'
  ).length;

  const renterName =
    user?.full_name?.trim() ||
    user?.name?.trim() ||
    'Renter';

  const renterEmail =
    user?.email || 'Email not available';

  const renterPhone =
    user?.phone || 'Phone not added';

  const initials = renterName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="renter">
      <div className="renter-db">
        <RenterWorkspaceHeader
          eyebrow="Your renter workspace"
          title="Welcome back,"
          highlight={`${renterName}!`}
          subtitle="Find your next home, keep track of saved properties and stay on top of owner replies."
          actionTo="/properties"
          actionLabel="Explore homes"
        />

        {loading ? (
          <div className="renter-db__loader">
            <Loader size="md" />
          </div>
        ) : loadError ? (
          <div className="renter-db__load-error">
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
            <div className="renter-db__stats">
              <StatisticCard
                value={favorites.length}
                label="Saved Properties"
                color="green"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M10 17S2 11.5 2 6.5a5 5 0 0110-1 5 5 0 0110 1C22 11.5 10 17 10 17z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                }
              />

              <StatisticCard
                value={inquiries.length}
                label="Total Inquiries"
                color="primary"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M17 3H3a1 1 0 00-1 1v9a1 1 0 001 1h4l3 3 3-3h4a1 1 0 001-1V4a1 1 0 00-1-1z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <StatisticCard
                value={pending}
                label="Pending Replies"
                color={pending > 0 ? 'amber' : 'default'}
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
                      d="M10 6v4l3 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />

              <StatisticCard
                value={favorites.length + inquiries.length}
                label="My Activity"
                color="default"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 15l4-4 3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 8h3v3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            </div>

            {/* ── Main layout ─────────────────────────── */}
            <div className="renter-db__layout">
              <div className="renter-db__main">
                {/* Quick actions */}
                <div className="renter-db__quick-actions">
                  <Link
                    to="/properties"
                    className="renter-db__action-card renter-db__action-card--primary"
                  >
                    <span className="renter-db__action-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle
                          cx="8.5"
                          cy="8.5"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M12.5 12.5L17 17"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>

                    <span>
                      <strong>Explore Homes</strong>
                      <small>
                        Find houses, flats & rooms
                      </small>
                    </span>

                    <span className="renter-db__action-arrow">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/renter/favorites"
                    className="renter-db__action-card"
                  >
                    <span className="renter-db__action-icon">
                      ♥
                    </span>

                    <span>
                      <strong>Saved Properties</strong>
                      <small>
                        View your favourite homes
                      </small>
                    </span>

                    <span className="renter-db__action-arrow">
                      →
                    </span>
                  </Link>

                  <Link
                    to="/renter/inquiries"
                    className="renter-db__action-card"
                  >
                    <span className="renter-db__action-icon">
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
                      <strong>My Inquiries</strong>
                      <small>
                        Track owner responses
                      </small>
                    </span>

                    <span className="renter-db__action-arrow">
                      →
                    </span>
                  </Link>
                </div>

                {/* Recent inquiries */}
                <section className="renter-db__section">
                  <div className="renter-db__section-header">
                    <div>
                      <h2 className="renter-db__section-title">
                        Recent Inquiries
                      </h2>

                      <p className="renter-db__section-subtitle">
                        Track your latest property conversations
                      </p>
                    </div>

                    <Link
                      to="/renter/inquiries"
                      className="renter-db__section-link"
                    >
                      View all →
                    </Link>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="renter-db__empty">
                      <EmptyState
                        title="No inquiries yet"
                        description="Browse properties and contact owners to get started."
                        action={{
                          label: 'Browse Properties',
                          onClick: () => navigate('/properties'),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="renter-db__inquiry-grid">
                      {inquiries.slice(0, 4).map((inquiry) => (
                        <InquiryCard
                          key={inquiry.id}
                          inquiry={inquiry}
                          viewAs="renter"
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Saved homes overview */}
                <section className="renter-db__section">
                  <div className="renter-db__section-header">
                    <div>
                      <h2 className="renter-db__section-title">
                        Saved Properties
                      </h2>

                      <p className="renter-db__section-subtitle">
                        Homes you have saved for later
                      </p>
                    </div>

                    <Link
                      to="/renter/favorites"
                      className="renter-db__section-link"
                    >
                      View saved →
                    </Link>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="renter-db__empty renter-db__empty--compact">
                      <div className="renter-db__saved-empty-icon">
                        ♥
                      </div>

                      <div>
                        <h3>No saved properties</h3>
                        <p>
                          Save homes you like so you can easily
                          find them later.
                        </p>
                      </div>

                      <Link
                        to="/properties"
                        className="renter-db__saved-empty-btn"
                      >
                        Explore homes
                      </Link>
                    </div>
                  ) : (
                    <div className="renter-db__saved-summary">
                      <div className="renter-db__saved-summary-icon">
                        ♥
                      </div>

                      <div>
                        <strong>
                          {favorites.length} saved{' '}
                          {favorites.length === 1
                            ? 'property'
                            : 'properties'}
                        </strong>

                        <span>
                          Your favourite homes are ready whenever
                          you are.
                        </span>
                      </div>

                      <Link
                        to="/renter/favorites"
                        className="renter-db__saved-summary-link"
                      >
                        View saved →
                      </Link>
                    </div>
                  )}
                </section>
              </div>

              {/* ── Profile sidebar ──────────────────── */}
              <aside className="renter-db__sidebar">
                <section className="renter-db__profile-card">
                  <div className="renter-db__profile-header">
                    <h2>My Profile</h2>

                    <span className="renter-db__profile-label">
                      Profile
                    </span>
                  </div>

                  <div className="renter-db__profile-main">
                    <div className="renter-db__avatar">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={renterName}
                        />
                      ) : (
                        initials || 'R'
                      )}
                    </div>

                    <div>
                      <h3>{renterName}</h3>

                      <span className="renter-db__role-badge">
                        Renter
                      </span>
                    </div>
                  </div>

                  <div className="renter-db__profile-details">
                    <div className="renter-db__profile-row">
                      <span className="renter-db__profile-icon">
                        ✉
                      </span>

                      <span>
                        <small>Email</small>
                        <strong>{renterEmail}</strong>
                      </span>
                    </div>

                    <div className="renter-db__profile-row">
                      <span className="renter-db__profile-icon">
                        ☎
                      </span>

                      <span>
                        <small>Phone</small>
                        <strong>{renterPhone}</strong>
                      </span>
                    </div>

                    <div className="renter-db__profile-row">
                      <span className="renter-db__profile-icon">
                        ✓
                      </span>

                      <span>
                        <small>Account</small>
                        <strong>Active Renter</strong>
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/renter/favorites"
                    className="renter-db__profile-btn"
                  >
                    View saved homes
                  </Link>
                </section>

                {/* Quick overview */}
                <section className="renter-db__side-card">
                  <div className="renter-db__side-card-title">
                    <span className="renter-db__side-card-icon">
                      ⚡
                    </span>
                    Quick overview
                  </div>

                  <div className="renter-db__overview-list">
                    <div>
                      <span>Saved properties</span>
                      <strong>{favorites.length}</strong>
                    </div>

                    <div>
                      <span>Total inquiries</span>
                      <strong>{inquiries.length}</strong>
                    </div>

                    <div>
                      <span>Pending replies</span>
                      <strong>{pending}</strong>
                    </div>
                  </div>
                </section>

                {/* Find home card */}
                <section className="renter-db__help-card">
                  <div className="renter-db__help-icon">
                    ⌂
                  </div>

                  <h3>Looking for a home?</h3>

                  <p>
                    Explore available properties and find a place
                    that fits your needs.
                  </p>

                  <Link
                    to="/properties"
                    className="renter-db__help-link"
                  >
                    Explore homes →
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
          className="renter-db__scroll-top"
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

export default RenterDashboard;