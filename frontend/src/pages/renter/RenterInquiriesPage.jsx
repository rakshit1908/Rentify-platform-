import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InquiryCard     from '../../components/dashboard/InquiryCard';
import Loader          from '../../components/common/Loader';
import EmptyState      from '../../components/common/EmptyState';
import ErrorState      from '../../components/common/ErrorState';
import { fetchMyInquiries } from '../../services/inquiries.service';
import './RenterPages.css';

const STATUS_TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed',    label: 'Closed' },
];

const NAV_ITEMS = [
  { to: '/dashboard/renter', label: 'Dashboard',       exact: true },
  { to: '/properties',       label: 'Explore Homes' },
  { to: '/renter/favorites', label: 'Saved Properties' },
  { to: '/renter/inquiries', label: 'My Inquiries' },
];

const RenterInquiriesPage = () => {
  const [all,        setAll]       = useState([]);
  const [activeTab,  setActiveTab] = useState('');
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyInquiries()
      .then((res) => setAll(res.data?.inquiries || []))
      .catch((err) => setError(err.message || 'Failed to load inquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = activeTab ? all.filter((i) => i.status === activeTab) : all;

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="renter">
      <div className="renter-page">
        <div className="renter-page__header">
          <h1 className="renter-page__title">My Inquiries</h1>
          <span className="renter-page__count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
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
              {tab.value && (
                <span className="renter-page__tab-count">
                  {all.filter((i) => i.status === tab.value).length}
                </span>
              )}
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
            action={{ label: 'Browse Properties', onClick: () => window.location.href = '/properties' }}
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
