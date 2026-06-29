import { Navbar } from '../navbar/Navbar';
import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        {title && <h2 className="dashboard-title">{title}</h2>}
        {children}
      </main>
    </div>
  );
}
