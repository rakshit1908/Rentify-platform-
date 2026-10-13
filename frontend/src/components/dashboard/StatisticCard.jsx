import './StatisticCard.css';

/**
 * StatisticCard
 * value, label, icon (JSX), color: 'primary'|'green'|'amber'|'red'|'default'
 */
const StatisticCard = ({ value, label, icon, color = 'default', loading = false }) => (
  <div className={`stat-card stat-card--${color}`} aria-label={`${label}: ${value}`}>
    {icon && <div className="stat-card__icon" aria-hidden="true">{icon}</div>}
    <div className="stat-card__body">
      {loading
        ? <div className="stat-card__skeleton" aria-hidden="true" />
        : <span className="stat-card__value">{value}</span>
      }
      <span className="stat-card__label">{label}</span>
    </div>
  </div>
);

export default StatisticCard;
