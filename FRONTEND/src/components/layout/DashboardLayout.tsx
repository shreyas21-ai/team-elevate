import { Outlet } from 'react-router-dom';
import { Navbar } from '../navbar/Navbar';
import { Sidebar } from '../sidebar/Sidebar';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
