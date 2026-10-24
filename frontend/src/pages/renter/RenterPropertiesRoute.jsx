import DashboardLayout from '../../components/layout/DashboardLayout';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';
import PropertiesPage from '../public/PropertiesPage';
import './RenterPages.css';

const NAV_ITEMS = [
  { to: '/dashboard/renter', label: 'Dashboard', exact: true },
  { to: '/properties', label: 'Explore Homes', exact: true },
  { to: '/renter/favorites', label: 'Saved Properties' },
  { to: '/renter/inquiries', label: 'My Inquiries' },
  { to: '/renter/profile', label: 'My Profile', exact: true },
];

const RenterPropertiesRoute = () => {
  const { user } = useAuth();

  if (user?.role === 'renter') {
    return (
      <DashboardLayout navItems={NAV_ITEMS} role="renter">
        <PropertiesPage />
      </DashboardLayout>
    );
  }

  return <PageLayout><PropertiesPage /></PageLayout>;
};

export default RenterPropertiesRoute;
