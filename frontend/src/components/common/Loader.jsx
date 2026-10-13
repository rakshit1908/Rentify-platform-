import './Loader.css';

/**
 * Loader
 * size: 'sm' | 'md' | 'lg'
 * fullPage: fills entire viewport
 */
const Loader = ({ size = 'md', fullPage = false, label = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className="loader-fullpage" role="status" aria-label={label}>
        <div className={`loader loader--${size}`}>
          <span className="loader__ring" />
        </div>
        <p className="loader-fullpage__text">{label}</p>
      </div>
    );
  }

  return (
    <div className={`loader loader--${size}`} role="status" aria-label={label}>
      <span className="loader__ring" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Loader;
