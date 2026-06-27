import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../../services/loanService';
import type { LoanApplication } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';

const statusVariant = (status: string) => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  return 'warning';
};

const TableSkeleton = () => (
  <div className="card" style={{ padding: 24 }}>
    <Skeleton width="160px" height="24px" />
    <div style={{ marginTop: 20 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
          <Skeleton width="40px" height="20px" />
          <Skeleton width="100px" height="20px" />
          <Skeleton width="180px" height="20px" />
          <Skeleton width="70px" height="24px" borderRadius="12px" />
          <Skeleton width="90px" height="20px" />
        </div>
      ))}
    </div>
  </div>
);

export const CustomerDashboard = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const pending = applications.filter((a) => a.status === 'pending').length;
  const approved = applications.filter((a) => a.status === 'approved').length;
  const rejected = applications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Customer Dashboard</h2>
          <p>Welcome back! Manage your loan applications.</p>
        </div>
        <Link to="/customer/apply" className="btn btn-primary">
          + Apply for Loan
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Applications</span>
          <span className="stat-value">{applications.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value stat-value-warning">{pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value stat-value-success">{approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value stat-value-error">{rejected}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">My Applications</h3>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : applications.length === 0 ? (
          <p className="empty-state">No applications yet. Apply for your first loan!</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="td-id">#{app.id}</td>
                    <td className="td-amount">${app.amount.toLocaleString()}</td>
                    <td className="td-purpose">{app.purpose}</td>
                    <td><Badge variant={statusVariant(app.status)}>{app.status}</Badge></td>
                    <td className="td-date">{new Date(app.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
