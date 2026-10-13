import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InquiryCard     from '../../components/dashboard/InquiryCard';
import Loader          from '../../components/common/Loader';
import EmptyState      from '../../components/common/EmptyState';
import ErrorState      from '../../components/common/ErrorState';
import { fetchOwnerInquiries } from '../../services/inquiries.service';
import './OwnerInquiriesPage.css';

const STATUS_TABS = [
  { value: '',          label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed',    label: 'Closed' },
];

const NAV_ITEMS = [
  { to: '/dashboard/owner',  label: 'Dashboard',     exact: true },
  { to: '/owner/properties', label: 'My Properties' },
  { to: '/owner/properties/new', label: 'Add Property' },
  { to: '/owner/inquiries',  label: 'Inquiries' },
];

const OwnerInquiriesPage = () => {
  const [inquiries,  setInquiries]  = useState([]);
  const [activeTab,  setActiveTab]  = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const load = (status = '') => {
    setLoading(true);
    setError('');
    fetchOwnerInquiries(status ? { status } : {})
      .then((res) => setInquiries(res.data?.inquiries || []))
      .catch((err) => setError(err.message || 'Failed to load inquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const handleStatusChange = (id, newStatus) => {
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i));
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="owner">
      <div className="owner-inq">
        <div className="owner-inq__header">
          <h1 className="owner-inq__title">Inquiries</h1>
          <span className="owner-inq__count">{inquiries.length} result{inquiries.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Tabs */}
        <div className="owner-inq__tabs" role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              className={`owner-inq__tab ${activeTab === tab.value ? 'owner-inq__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-16)', display: 'flex', justifyContent: 'center' }}>
            <Loader size="md" />
          </div>
        ) : error ? (
          <ErrorState type="inline" title={error} onRetry={() => load(activeTab)} />
        ) : inquiries.length === 0 ? (
          <EmptyState title="No inquiries found" description="They'll appear here when renters contact you." />
        ) : (
          <div className="owner-inq__grid">
            {inquiries.map((inq) => (
              <InquiryCard key={inq.id} inquiry={inq} viewAs="owner"
                onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerInquiriesPage;
