import './Input.css';

/**
 * Input
 * type: any HTML input type
 * error: string — shows error message + red border
 */
const Input = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error = '',
  hint = '',
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...rest
}) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={`input-field ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {required && <span className="input-field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`input-field__wrapper ${error ? 'input-field__wrapper--error' : ''} ${disabled ? 'input-field__wrapper--disabled' : ''}`}>
        {leftIcon && (
          <span className="input-field__icon input-field__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`input-field__input ${leftIcon ? 'input-field__input--left-icon' : ''} ${rightIcon ? 'input-field__input--right-icon' : ''}`}
          {...rest}
        />
        {rightIcon && (
          <span className="input-field__icon input-field__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span id={`${inputId}-error`} className="input-field__error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${inputId}-hint`} className="input-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
};

export default Input;
