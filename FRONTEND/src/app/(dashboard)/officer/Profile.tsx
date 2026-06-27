import { useAuth } from '../../../hooks/useAuth';

export const OfficerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <h2>Profile</h2>
      <p>Manage your profile information.</p>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginTop: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Name</label>
            <p style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 500 }}>{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Email</label>
            <p style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 500 }}>{user?.email || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Role</label>
            <p style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 500, textTransform: 'capitalize' }}>{user?.role || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
