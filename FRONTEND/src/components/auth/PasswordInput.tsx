import { useState, forwardRef, type InputHTMLAttributes } from 'react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
        <label htmlFor={id}>{label}</label>
        <div className="password-wrapper">
          <input id={id} ref={ref} type={show ? 'text' : 'password'} {...props} />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
