import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import './AuthPages.css';

const ROLE_OPTIONS = [
  { value: 'renter', label: 'I want to rent a property' },
  { value: 'owner',  label: 'I want to list a property' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    confirm_password: '', phone: '', role: '',
  });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  if (isAuthenticated && user) {
    const dest = user.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter';
    navigate(dest, { replace: true });
    return null;
  }

  const change = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: '' }));
    setServerError('');
    setFieldErrors([]);
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())  errs.full_name = 'Full name is required.';
    if (!form.email.trim())      errs.email     = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)          errs.password  = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match.';
    if (!form.role)              errs.role      = 'Please select a role.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    setFieldErrors([]);

    const result = await register({
      full_name: form.full_name.trim(),
      email:     form.email.trim(),
      password:  form.password,
      phone:     form.phone.trim() || undefined,
      role:      form.role,
    });

    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message || 'Registration failed.');
      if (result.errors?.length) setFieldErrors(result.errors);
      return;
    }

    const dest = result.data?.user?.role === 'owner'
      ? '/dashboard/owner'
      : '/dashboard/renter';
    navigate(dest, { replace: true });
  };

  // Map backend field errors to per-field display
  const fieldErr = (name) =>
    fieldErrors.find((e) => e.field === name)?.message || errors[name] || '';

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card__logo" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <path d="M4 11.5L14 4l10 7.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
              fill="var(--color-primary-500)" stroke="var(--color-primary-500)"
              strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="10" y="16" width="8" height="9" rx="1"
              fill="var(--color-secondary-500)" stroke="var(--color-secondary-500)" strokeWidth="1"/>
          </svg>
        </div>

        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__sub">Join Rentify — free forever</p>

        {serverError && (
          <ErrorState type="inline" title={serverError} description="" />
        )}

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          <div className="auth-card__row">
            <Input
              label="Full name"
              placeholder="Arjun Sharma"
              value={form.full_name}
              onChange={change('full_name')}
              error={fieldErr('full_name')}
              required
              autoComplete="name"
              disabled={submitting}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={change('phone')}
              error={fieldErr('phone')}
              autoComplete="tel"
              hint="10-digit Indian mobile number"
              disabled={submitting}
            />
          </div>

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={change('email')}
            error={fieldErr('email')}
            required
            autoComplete="email"
            disabled={submitting}
          />

          <div className="auth-card__row">
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={change('password')}
              error={fieldErr('password')}
              required
              autoComplete="new-password"
              disabled={submitting}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirm_password}
              onChange={change('confirm_password')}
              error={fieldErr('confirm_password')}
              required
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>

          {/* ==================================================
              ROLE CHOICE
              The two main Rentify journeys: find a home or list
              a property. The selected role is sent to the existing
              backend registration flow unchanged.
          ================================================== */}
          <div className="role-choice">
            <div className="role-choice__heading">What do you want to do?</div>
            <div className="role-choice__grid">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`role-choice__card ${form.role === option.value ? 'role-choice__card--active' : ''}`}
                  onClick={() => {
                    setForm((f) => ({ ...f, role: option.value }));
                    setErrors((e) => ({ ...e, role: '' }));
                  }}
                  disabled={submitting}
                  aria-pressed={form.role === option.value}
                >
                  <span className="role-choice__icon">{option.value === 'renter' ? '⌂' : '+'}</span>
                  <span>
                    <strong>{option.value === 'renter' ? 'Find a Home' : 'List a Property'}</strong>
                    <small>{option.value === 'renter' ? 'Search houses, flats & rooms' : 'Reach renters looking for a home'}</small>
                  </span>
                  <span className="role-choice__check">{form.role === option.value ? '✓' : ''}</span>
                </button>
              ))}
            </div>
            {fieldErr('role') && <p className="role-choice__error">{fieldErr('role')}</p>}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            disabled={submitting}
          >
            Create account
          </Button>
        </form>

        <p className="auth-card__footer-text">
          Already have an account?{' '}
          <Link to="/auth/login" className="auth-card__link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
