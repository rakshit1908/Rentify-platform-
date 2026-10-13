import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './PageLayout.css';

/**
 * PageLayout — wraps every public-facing page with Navbar + Footer.
 * The <Outlet /> renders the matched child route.
 */
const PageLayout = () => {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-layout__main" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
