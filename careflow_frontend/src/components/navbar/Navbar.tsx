import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand" onClick={() => navigate('/')}>
        <span className="navbar__logo">+</span>
        CareFlow
      </div>
      {user && (
        <div className="navbar__right">
          <span className="navbar__user">
            {user.full_name}
            <span className="navbar__role">{user.role}</span>
          </span>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
