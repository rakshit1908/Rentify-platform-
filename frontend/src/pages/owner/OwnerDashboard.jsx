import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import DashboardLayout from '../../components/layout/DashboardLayout';
import StatisticCard from '../../components/dashboard/StatisticCard';
import InquiryCard from '../../components/dashboard/InquiryCard';
import PropertyCard from '../../components/property/PropertyCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
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

  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [pRes, iRes, sRes] = await Promise.all([
          fetchMyProperties(),
          fetchOwnerInquiries({ limit: 5 }),
          fetchInquiryStats(),
        ]);

        if (!mounted) return;

        setProperties(pRes?.data?.properties || []);
        setInquiries(iRes?.data?.inquiries || []);
        setStats(sRes?.data || {});
      } catch (error) {
        console.error(
          '[OwnerDashboard] Failed to load dashboard:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
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
    setInquiries((previous) =>
      previous.map((inquiry) =>
        inquiry.id === id
          ? { ...inquiry, status: newStatus }
          : inquiry
      )
    );
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

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="owner">
      <div className="owner-db">
        {/* ── Top Header ─────────────────────────────── */}
        <header className="owner-db__header">
          <div>
            <div className="owner-db__eyebrow">
              Owner workspace
            </div>

            <h1 className="owner-db__title">
              Dashboard
            </h1>

            <p className="owner-db__subtitle">
              Manage your properties, inquiries and rental activity
              from one place.
            </p>
          </div>

          <Link
            to="/owner/properties/new"
            className="owner-db__add-btn"
          >
            <span className="owner-db__add-icon">+</span>
            Add property
          </Link>
        </header>

        {loading ? (
          <div className="owner-db__loader">
            <Loader size="md" />
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
                    <path
                      d="M10 2a6 6 0 100 12A6 6 0 0010 2zM4 18a8 8 0 0112 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />

              <StatisticCard
                value={stats?.total || 0}
                label="Total Inquiries"
                color="default"
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
                value={stats?.pending || 0}
                label="Pending Inquiries"
                color="red"
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
                          onClick: () => {},
                        }}
                      />
                    </div>
                  ) : (
                    <div className="owner-db__property-grid">
                      {properties.slice(0, 3).map((property) => (
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

                    <span className="owner-db__profile-edit">
                      Profile
                    </span>
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
                    to="/dashboard/owner"
                    className="owner-db__profile-btn"
                  >
                    View account
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
    </DashboardLayout>
  );
};

export default OwnerDashboard;