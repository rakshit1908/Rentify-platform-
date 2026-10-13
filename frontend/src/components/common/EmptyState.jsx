import './EmptyState.css';
import Button from './Button';

/**
 * EmptyState — shown when a list or section has no data.
 */
const EmptyState = ({
  icon = null,
  title = 'Nothing here yet',
  description = '',
  action = null,   // { label, onClick, variant }
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`.trim()} role="status">
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {!icon && (
        <div className="empty-state__icon empty-state__icon--default" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && (
        <div className="empty-state__action">
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
