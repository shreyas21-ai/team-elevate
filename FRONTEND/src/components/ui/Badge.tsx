import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

export const Badge = ({ variant = 'default', children }: BadgeProps) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
