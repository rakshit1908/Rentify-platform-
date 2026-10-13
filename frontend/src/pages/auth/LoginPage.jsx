import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import './AuthPages.css';

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, loading, isAuthenticated, user } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Already logged in — redirect away
  if (isAuthenticated && user) {
    const dest = user.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter';
    navigate(dest, { replace: true });
    return null;
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

    const result = await login({ email: form.email.trim(), password: form.password });

    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message || 'Sign in failed.');
      return;
    }

    // Redirect to the page they were trying to reach, or role dashboard
    const from = location.state?.from;
    const dest = from || (result.user.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter');
    navigate(dest, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <path d="M4 11.5L14 4l10 7.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
              fill="var(--color-primary-500)" stroke="var(--color-primary-500)"
              strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="10" y="16" width="8" height="9" rx="1"
              fill="var(--color-secondary-500)" stroke="var(--color-secondary-500)" strokeWidth="1"/>
          </svg>
        </div>

        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__sub">Sign in to your Rentify account</p>

        {serverError && (
          <ErrorState
            type="inline"
            title={serverError}
            description=""
          />
        )}

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
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
  );
};

export default LoginPage;
