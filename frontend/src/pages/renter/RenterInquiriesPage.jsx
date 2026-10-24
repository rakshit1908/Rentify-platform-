import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InquiryCard     from '../../components/dashboard/InquiryCard';
import Loader          from '../../components/common/Loader';
import EmptyState      from '../../components/common/EmptyState';
import ErrorState      from '../../components/common/ErrorState';
import { fetchMyInquiries } from '../../services/inquiries.service';
import RenterWorkspaceHeader from './RenterWorkspaceHeader';
import './RenterPages.css';

const STATUS_TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed',    label: 'Closed' },
];

const NAV_ITEMS = [
  { to: '/dashboard/renter', label: 'Dashboard',       exact: true },
  { to: '/properties',       label: 'Explore Homes',   exact: true },
  { to: '/renter/favorites', label: 'Saved Properties' },
  { to: '/renter/inquiries', label: 'My Inquiries' },
  { to: '/renter/profile',   label: 'My Profile' },
];

const RenterInquiriesPage = () => {
  const navigate = useNavigate();
  const [all,        setAll]       = useState([]);
  const [activeTab,  setActiveTab] = useState('');
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [search,     setSearch]    = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyInquiries()
      .then((res) => setAll(res.data?.inquiries || []))
      .catch((err) => setError(err.message || 'Failed to load inquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => all.filter((inquiry) => {
    const matchesStatus = !activeTab || inquiry.status === activeTab;
    const property = inquiry.properties || inquiry.property;
    const searchable = [
      inquiry.message,
      inquiry.status,
      inquiry.renter?.full_name,
      property?.title,
      property?.city,
      property?.state,
    ].filter(Boolean).join(' ').toLowerCase();
    return matchesStatus && searchable.includes(search.trim().toLowerCase());
  }), [all, activeTab, search]);

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="renter">
      <div className="renter-page">
        <RenterWorkspaceHeader
          eyebrow="Stay in the conversation"
          title="My"
          highlight="Inquiries"
          subtitle="Follow your messages to property owners and keep up with responses about your next home."
          actionTo="/properties"
          actionLabel="Explore homes"
        />

        <div className="renter-page__toolbar">
          <div>
            <h2>Your conversations</h2>
            <p>{filtered.length} of {all.length} conversations</p>
          </div>
          <label className="renter-page__search">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inquiries..." aria-label="Search inquiries" />
          </label>
        </div>

        {/* Tabs */}
        <div className="renter-page__tabs" role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              className={`renter-page__tab ${activeTab === tab.value ? 'renter-page__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
              <span className="renter-page__tab-count">
                {tab.value ? all.filter((i) => i.status === tab.value).length : all.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="renter-page__loader"><Loader size="md" /></div>
        ) : error ? (
          <ErrorState type="inline" title={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No inquiries found"
            description="Contact a property owner to send your first inquiry."
            action={{
              label: search || activeTab ? 'Clear filters' : 'Browse Properties',
              onClick: () => {
                if (search || activeTab) {
                  setSearch('');
                  setActiveTab('');
                } else {
                  navigate('/properties');
                }
              },
              variant: search || activeTab ? 'outline' : 'primary',
            }}
          />
        ) : (
          <div className="renter-page__grid">
            {filtered.map((inq) => (
              <InquiryCard key={inq.id} inquiry={inq} viewAs="renter" />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RenterInquiriesPage;
