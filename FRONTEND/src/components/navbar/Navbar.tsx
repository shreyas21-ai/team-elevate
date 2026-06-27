import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">LoanFlow</span>
      </div>
      <div className="navbar-center">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="navbar-right">
        <button className="icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <div className="profile-menu">
          <button className="icon-btn" onClick={() => setShowProfile((p) => !p)}>
            <Avatar name={user?.name || 'U'} size="sm" />
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <span className="profile-name">{user?.name}</span>
                <span className="profile-role">{user?.role}</span>
              </div>
              <hr />
              <button className="dropdown-item" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
