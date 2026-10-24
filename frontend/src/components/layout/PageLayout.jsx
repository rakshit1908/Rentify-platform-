import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './PageLayout.css';

/**
 * PageLayout — wraps every public-facing page with Navbar + Footer.
 * The <Outlet /> renders the matched child route.
 */
const PageLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isImmersiveAuthPage = pathname === '/auth/register'
    || pathname === '/auth/login'
    || pathname === '/auth/forgot-password';

  return (
    <div className={`page-layout ${isImmersiveAuthPage ? 'page-layout--immersive-auth' : ''}`}>
      <Navbar />
      <main className="page-layout__main" id="main-content">
        {children || <Outlet />}
      </main>
      {!isImmersiveAuthPage && <Footer />}
    </div>
  );
};

export default PageLayout;
