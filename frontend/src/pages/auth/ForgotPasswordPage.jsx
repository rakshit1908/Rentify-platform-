import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail]         = useState('');
  const [emailError, setEmailError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]           = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) { setEmailError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setRequestError('');
    try {
      const result = await forgotPassword(normalizedEmail);
      if (!result?.success) {
        setRequestError(result?.message || 'Unable to send a reset link. Please try again.');
        return;
      }
      setSent(true);
    } catch (error) {
      setRequestError(error.message || 'Unable to send a reset link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--forgot">
      <div className="auth-card auth-card--forgot">
        <div className="auth-card__logo" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <path d="M4 11.5L14 4l10 7.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
              fill="var(--color-primary-500)" stroke="var(--color-primary-500)"
              strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="10" y="16" width="8" height="9" rx="1"
              fill="var(--color-secondary-500)" stroke="var(--color-secondary-500)" strokeWidth="1"/>
          </svg>
        </div>

        {sent ? (
          /* ── Success state ─────────────────────────────── */
          <div className="auth-card__success">
            <div className="auth-card__success-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="var(--color-secondary-500)" strokeWidth="2"/>
                <path d="M12 20l6 6 10-12" stroke="var(--color-secondary-500)"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="auth-card__title">Check your inbox</h1>
            <p className="auth-card__sub" style={{ maxWidth: '36ch', textAlign: 'center' }}>
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
              Check your spam folder if you don't see it.
            </p>
            <Link to="/auth/login" className="btn btn--outline btn--md" style={{ marginTop: 'var(--space-4)' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form ──────────────────────────────────────── */
          <>
            <h1 className="auth-card__title">Forgot password?</h1>
            <p className="auth-card__sub">
              Enter your email and we'll send you a reset link.
            </p>

            <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                error={emailError}
                required
                autoComplete="email"
                autoFocus
                disabled={submitting}
              />
              {requestError && <p className="auth-card__request-error" role="alert">{requestError}</p>}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={submitting}
              >
                Send reset link
              </Button>
            </form>

            <p className="auth-card__footer-text">
              Remember your password?{' '}
              <Link to="/auth/login" className="auth-card__link">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
