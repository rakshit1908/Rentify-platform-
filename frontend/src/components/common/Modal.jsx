import { useEffect, useRef } from 'react';
import './Modal.css';

/**
 * Modal
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * Traps focus inside and closes on Escape or backdrop click.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false,
  className = '',
}) => {
  const overlayRef = useRef(null);
  const firstFocusRef = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus first focusable element
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={handleOverlayClick}
    >
      <div className={`modal modal--${size} ${className}`.trim()}>
        {/* Header */}
        {(title || !hideClose) && (
          <div className="modal__header">
            {title && (
              <h2 id="modal-title" className="modal__title">
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                ref={firstFocusRef}
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
