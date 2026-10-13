import { useState } from 'react';
import Modal  from './Modal';
import Input  from './Input';
import Button from './Button';
import { createInquiry } from '../../services/inquiries.service';
import { useAuth } from '../../context/AuthContext';
import './ContactModal.css';

const MAX_MSG = 500;

/**
 * ContactModal
 * isOpen, onClose, property: { id, title, owner: { full_name } }
 * onSuccess() — called after inquiry is sent
 */
const ContactModal = ({ isOpen, onClose, property, onSuccess }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
    message: '',
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]           = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Your name is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid 10-digit mobile number.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError('');
    try {
      await createInquiry({
        property_id: property.id,
        message:     form.message.trim(),
        phone:       form.phone.trim() || undefined,
      });
      setSent(true);
      onSuccess?.();
    } catch (err) {
      setServerError(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setForm({ name: user?.full_name || '', phone: user?.phone || '', message: '' });
    setErrors({});
    setServerError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Contact Owner" size="md">
      {sent ? (
        <div className="contact-modal__success">
          <div className="contact-modal__success-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--color-secondary-500)" strokeWidth="2"/>
              <path d="M12 20l6 6 10-12" stroke="var(--color-secondary-500)"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="contact-modal__success-title">Inquiry sent!</h3>
          <p className="contact-modal__success-sub">
            The owner of <strong>{property?.title}</strong> will be in touch with you soon.
          </p>
          <Button variant="primary" onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <form className="contact-modal__form" onSubmit={handleSubmit} noValidate>
          {property && (
            <div className="contact-modal__property-tag">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 6.5L7 2l4 4.5V12H3V6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <rect x="5" y="8.5" width="4" height="3.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {property.title}
            </div>
          )}

          {serverError && (
            <div className="contact-modal__error" role="alert">{serverError}</div>
          )}

          <Input
            label="Your name"
            placeholder="Arjun Sharma"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            required
            disabled={submitting}
          />
          <Input
            label="Phone number (optional)"
            type="tel"
            placeholder="9876543210"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            hint="The owner may call you on this number."
            disabled={submitting}
          />

          <div className="contact-modal__msg-field">
            <label className="contact-modal__label" htmlFor="cm-message">
              Message <span className="contact-modal__req" aria-hidden="true">*</span>
            </label>
            <textarea
              id="cm-message"
              className={`contact-modal__textarea ${errors.message ? 'contact-modal__textarea--error' : ''}`}
              placeholder="Hi, I'm interested in this property. Could you please share more details about availability and terms?"
              value={form.message}
              onChange={set('message')}
              rows={5}
              maxLength={MAX_MSG}
              disabled={submitting}
              required
            />
            <div className="contact-modal__msg-footer">
              {errors.message && <span className="contact-modal__field-err">{errors.message}</span>}
              <span className={`contact-modal__char-count ${form.message.length > MAX_MSG * 0.9 ? 'contact-modal__char-count--warn' : ''}`}>
                {form.message.length}/{MAX_MSG}
              </span>
            </div>
          </div>

          <div className="contact-modal__actions">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
              Send inquiry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ContactModal;
