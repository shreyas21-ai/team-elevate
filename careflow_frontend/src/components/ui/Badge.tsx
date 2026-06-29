import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

const VARIANTS: Record<string, string> = {
  default: 'badge--default',
  success: 'badge--success',
  warning: 'badge--warning',
  danger: 'badge--danger',
  info: 'badge--info',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.default}`}>
      {children}
    </span>
  );
}
