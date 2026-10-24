import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import './AuthPages.css';

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '', role: 'renter' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Already logged in — redirect away
  if (isAuthenticated && user) {
    const dest = user.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter';
    return <Navigate to={dest} replace />;
  }

  const change = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)        errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');

    const result = await login({
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });

    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message || 'Sign in failed.');
      return;
    }

    const requestedPath = location.state?.from;
    const roleHome = result.user.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter';
    const rolePrefix = result.user.role === 'owner' ? '/owner' : '/renter';
    const isAllowedDestination = typeof requestedPath === 'string'
      && (requestedPath === roleHome || requestedPath.startsWith(`${rolePrefix}/`));
    const dest = isAllowedDestination ? requestedPath : roleHome;
    navigate(dest, { replace: true });
  };

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-login">
        <section className="auth-login__intro" aria-label="Welcome to Rentify">
          <div className="auth-login__intro-copy">
            <span className="auth-login__eyebrow"><span aria-hidden="true">⌂</span> Welcome to Rentify</span>
            <h2>Your next<br />chapter starts<br /><span>at home.</span></h2>
            <p>Find a place to call home, connect with owners, and make your next move with confidence.</p>

            <div className="auth-login__features">
              <div>
                <span className="auth-login__feature-icon auth-login__feature-icon--violet" aria-hidden="true">⌂</span>
                <span><strong>Find verified homes</strong><small>Explore genuine listings from trusted owners</small></span>
              </div>
              <div>
                <span className="auth-login__feature-icon auth-login__feature-icon--blue" aria-hidden="true">▤</span>
                <span><strong>Connect with owners</strong><small>Keep all your property conversations together</small></span>
              </div>
              <div>
                <span className="auth-login__feature-icon auth-login__feature-icon--green" aria-hidden="true">✓</span>
                <span><strong>One account, more options</strong><small>Choose the workspace that fits your journey</small></span>
              </div>
            </div>

            <div className="auth-login__community">
              <span className="auth-login__community-avatars" aria-hidden="true">
                <i>R</i><i>H</i><i>A</i>
              </span>
              <span className="auth-login__community-count">10K+</span>
              <span className="auth-login__community-copy">renters finding<br />their perfect home</span>
            </div>
          </div>
        </section>

        <div className="auth-card auth-login__card">
        <h1 className="auth-card__title">Welcome <span>back</span></h1>
        <p className="auth-card__sub">Sign in to your Rentify account</p>

        {serverError && (
          <ErrorState
            type="inline"
            title={serverError}
            description=""
          />
        )}

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          <fieldset className="login-role">
            <legend className="login-role__heading">Choose your account type</legend>
            <div className="login-role__options">
              <button
                type="button"
                className={`login-role__option ${form.role === 'renter' ? 'login-role__option--active' : ''}`}
                onClick={() => {
                  setForm((current) => ({ ...current, role: 'renter' }));
                  setServerError('');
                }}
                aria-pressed={form.role === 'renter'}
                disabled={submitting}
              >
                <span className="login-role__icon" aria-hidden="true">⌂</span>
                <span className="login-role__copy"><strong>Login as a renter</strong><small>Find and manage your home</small></span>
                <span className="login-role__check" aria-hidden="true">{form.role === 'renter' ? '✓' : ''}</span>
              </button>
              <button
                type="button"
                className={`login-role__option ${form.role === 'owner' ? 'login-role__option--active' : ''}`}
                onClick={() => {
                  setForm((current) => ({ ...current, role: 'owner' }));
                  setServerError('');
                }}
                aria-pressed={form.role === 'owner'}
                disabled={submitting}
              >
                <span className="login-role__icon" aria-hidden="true">⌂</span>
                <span className="login-role__copy"><strong>Login as an owner</strong><small>Manage your listings and inquiries</small></span>
                <span className="login-role__check" aria-hidden="true">{form.role === 'owner' ? '✓' : ''}</span>
              </button>
            </div>
          </fieldset>

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={change('email')}
            error={errors.email}
            required
            autoComplete="email"
            disabled={submitting}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={change('password')}
            error={errors.password}
            required
            autoComplete="current-password"
            disabled={submitting}
          />

          <div className="auth-card__forgot">
            <Link to="/auth/forgot-password" className="auth-card__link">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            disabled={submitting}
          >
            Sign in
          </Button>
        </form>

        <p className="auth-card__footer-text">
          Don't have an account?{' '}
          <Link to="/auth/register" className="auth-card__link">
            Create one
          </Link>
        </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
