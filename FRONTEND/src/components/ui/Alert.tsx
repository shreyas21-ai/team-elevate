import type { ReactNode } from 'react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  children: ReactNode;
}

export const Alert = ({ type = 'error', children }: AlertProps) => {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
};
