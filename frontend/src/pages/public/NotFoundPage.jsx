import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => (
  <div className="not-found">
    <span className="not-found__code" aria-hidden="true">404</span>
    <h1 className="not-found__title">Page not found</h1>
    <p className="not-found__desc">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn btn--primary btn--md not-found__btn">
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;
