import { useAuth } from '../../../hooks/useAuth';

export const OfficerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="page page-narrow">
      <h2>Profile</h2>
      <p>Manage your profile information.</p>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="profile-details">
          <div className="profile-field">
            <span className="profile-label">Name</span>
            <span className="profile-value">{user?.name || 'N/A'}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user?.email || 'N/A'}</span>
          </div>
          <div className="profile-field">
            <span className="profile-label">Role</span>
            <span className="profile-value profile-role">{user?.role || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
