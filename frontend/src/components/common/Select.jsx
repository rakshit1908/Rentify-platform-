import './Select.css';

/**
 * Select
 * options: [{ value, label }]
 */
const Select = ({
  id,
  label,
  options = [],
  value,
  onChange,
  onBlur,
  placeholder = 'Select an option',
  error = '',
  hint = '',
  disabled = false,
  required = false,
  className = '',
  ...rest
}) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={`select-field ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select-field__label">
          {label}
          {required && <span className="select-field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`select-field__wrapper ${error ? 'select-field__wrapper--error' : ''} ${disabled ? 'select-field__wrapper--disabled' : ''}`}>
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          className="select-field__select"
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span className="select-field__chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="select-field__error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${selectId}-hint`} className="select-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
};

export default Select;
