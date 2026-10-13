import './ErrorState.css';
import Button from './Button';

/**
 * ErrorState — inline or full-page error display.
 * type: 'inline' | 'page'
 */
const ErrorState = ({
  type = 'inline',
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div className={`error-state error-state--${type} ${className}`.trim()} role="alert">
      <div className="error-state__icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 12v10M20 27v1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="error-state__content">
        <h3 className="error-state__title">{title}</h3>
        {description && (
          <p className="error-state__description">{description}</p>
        )}
        {onRetry && (
          <div className="error-state__action">
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
