import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import './Sidebar.css';

const customerMenu = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/customer/apply', label: 'Apply for Loan', icon: '📝' },
  { to: '/customer/history', label: 'My Applications', icon: '📋' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' },
];

const officerMenu = [
  { to: '/officer/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/officer/applications', label: 'Pending Applications', icon: '⏳' },
  { to: '/officer/profile', label: 'Profile', icon: '👤' },
];

export const Sidebar = () => {
  const { role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const menu = role === 'officer' ? officerMenu : customerMenu;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? '→' : '←'}
      </button>
      <div className="sidebar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-footer">
        <button className="sidebar-link logout-btn" onClick={logout}>
          <span className="sidebar-icon">🚪</span>
          {!collapsed && <span className="sidebar-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
