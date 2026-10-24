import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import RenterWorkspaceHeader from './RenterWorkspaceHeader';
import './RenterPages.css';

const NAV_ITEMS = [
  { to: '/dashboard/renter', label: 'Dashboard', exact: true },
  { to: '/properties', label: 'Explore Homes', exact: true },
  { to: '/renter/favorites', label: 'Saved Properties' },
  { to: '/renter/inquiries', label: 'My Inquiries' },
  { to: '/renter/profile', label: 'My Profile', exact: true },
];

const RenterProfilePage = () => {
  const { user } = useAuth();
  const fullName = user?.full_name || user?.name || 'Renter';
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0].toUpperCase()).join('');

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="renter">
      <div className="renter-page">
        <RenterWorkspaceHeader
          eyebrow="Your account"
          title="My"
          highlight="Profile"
          subtitle="Review the account details connected to your Rentify renter account."
          actionTo="/properties"
          actionLabel="Explore homes"
        />

        <section className="renter-profile" aria-labelledby="renter-profile-title">
          <div className="renter-profile__identity">
            <div className="renter-profile__avatar">
              {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials || 'R'}
            </div>
            <div>
              <span className="renter-profile__eyebrow">Renter account</span>
              <h2 id="renter-profile-title">{fullName}</h2>
              <span className="renter-profile__badge">Active renter</span>
            </div>
          </div>

          <div className="renter-profile__details">
            <div className="renter-profile__detail">
              <span className="renter-profile__detail-icon" aria-hidden="true">✉</span>
              <div><small>Email address</small><strong>{user?.email || 'Not provided'}</strong></div>
            </div>
            <div className="renter-profile__detail">
              <span className="renter-profile__detail-icon" aria-hidden="true">☎</span>
              <div><small>Phone number</small><strong>{user?.phone || 'Not provided'}</strong></div>
            </div>
            <div className="renter-profile__detail">
              <span className="renter-profile__detail-icon" aria-hidden="true">⌂</span>
              <div><small>Account type</small><strong>Renter</strong></div>
            </div>
          </div>

          <p className="renter-profile__note">
            Your account details are securely loaded from your Rentify profile.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default RenterProfilePage;
