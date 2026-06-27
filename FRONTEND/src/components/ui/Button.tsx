import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  children: ReactNode;
}

export const Button = ({ variant = 'primary', loading, children, className = '', disabled, ...props }: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} ${className}${loading ? ' btn-loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner-sm" />}
      {children}
    </button>
  );
};
