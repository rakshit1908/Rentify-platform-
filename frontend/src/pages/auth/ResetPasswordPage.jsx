import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../services/supabase';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [accessToken, setAccessToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError]   = useState('');

  const [form, setForm]     = useState({ password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone]     = useState(false);

  /* Extract access_token from URL hash (Supabase puts it there) */
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token  = params.get('access_token');
    const type   = params.get('type');

    if (token && type === 'recovery') {
      setAccessToken(token);
      setTokenLoading(false);
    } else {
      // Also check via Supabase session (handles PKCE flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          setAccessToken(session.access_token);
        } else {
          setTokenError('Invalid or expired reset link. Please request a new one.');
        }
        setTokenLoading(false);
      });
    }
  }, []);

  const change = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.password)         errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');

    const result = await resetPassword({
      password:         form.password,
      confirm_password: form.confirm_password,
      access_token:     accessToken,
    });

    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message || 'Password reset failed.');
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/auth/login', { replace: true }), 3000);
  };

  if (tokenLoading) return <Loader fullPage label="Verifying reset link..." />;

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

        {tokenError ? (
          <div className="auth-card__success">
            <ErrorState
              type="inline"
              title={tokenError}
              description=""
            />
            <Link to="/auth/forgot-password" className="btn btn--primary btn--md"
              style={{ marginTop: 'var(--space-4)' }}>
              Request new reset link
            </Link>
          </div>
        ) : done ? (
          <div className="auth-card__success">
            <div className="auth-card__success-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="var(--color-secondary-500)" strokeWidth="2"/>
                <path d="M12 20l6 6 10-12" stroke="var(--color-secondary-500)"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="auth-card__title">Password updated</h1>
            <p className="auth-card__sub">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <h1 className="auth-card__title">Set new password</h1>
            <p className="auth-card__sub">Choose a strong password for your account.</p>

            {serverError && (
              <ErrorState type="inline" title={serverError} description="" />
            )}

            <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
              <Input
                label="New password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={change('password')}
                error={errors.password}
                required
                autoComplete="new-password"
                disabled={submitting}
              />
              <Input
                label="Confirm new password"
                type="password"
                placeholder="Re-enter your new password"
                value={form.confirm_password}
                onChange={change('confirm_password')}
                error={errors.confirm_password}
                required
                autoComplete="new-password"
                disabled={submitting}
              />
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={submitting}
              >
                Update password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
