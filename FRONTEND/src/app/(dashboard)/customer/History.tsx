import { useState, useEffect } from 'react';
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
          <Skeleton width="100px" height="20px" />
          <Skeleton width="70px" height="24px" borderRadius="12px" />
          <Skeleton width="90px" height="20px" />
        </div>
      ))}
    </div>
  </div>
);

export const CustomerHistory = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h2>My Applications</h2>
      <p>View the status of all your loan applications.</p>

      <div className="card" style={{ marginTop: 24 }}>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <p className="empty-state">{error}</p>
        ) : applications.length === 0 ? (
          <p className="empty-state">No applications found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Monthly Income</th>
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
                    <td className="td-amount">${app.monthly_income.toLocaleString()}</td>
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
