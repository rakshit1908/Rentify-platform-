import './Skeleton.css';

/**
 * Skeleton — shimmer placeholder while content loads.
 * variant: 'text' | 'rect' | 'circle'
 */
const Skeleton = ({
  variant = 'rect',
  width,
  height,
  className = '',
  lines = 1,   // for variant='text', renders multiple lines
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-lines">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={`skeleton skeleton--text ${className}`.trim()}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

/* Convenience: property card skeleton */
export const PropertyCardSkeleton = () => (
  <div className="skeleton-card">
    <Skeleton variant="rect" height="200px" className="skeleton-card__image" />
    <div className="skeleton-card__body">
      <Skeleton variant="text" width="60%" height="14px" />
      <Skeleton variant="text" lines={2} />
      <div className="skeleton-card__footer">
        <Skeleton variant="text" width="80px" height="12px" />
        <Skeleton variant="rect" width="90px" height="32px" />
      </div>
    </div>
  </div>
);

export default Skeleton;
