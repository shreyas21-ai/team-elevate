import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getPendingApplications } from '../../../services/loanService';
import type { LoanApplication } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'];

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
          <Skeleton width="60px" height="20px" />
        </div>
      ))}
    </div>
  </div>
);

export const OfficerDashboard = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPendingApplications()
      .then(setApplications)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  const approved = applications.filter((a) => a.status === 'approved').length;
  const rejected = applications.filter((a) => a.status === 'rejected').length;
  const pending = applications.filter((a) => a.status === 'pending').length;

  const pieData = [
    { name: 'Pending', value: pending || 1 },
    { name: 'Approved', value: approved || 0 },
    { name: 'Rejected', value: rejected || 0 },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Officer Dashboard</h2>
          <p>Review and manage loan applications.</p>
        </div>
        <Link to="/officer/applications" className="btn btn-primary">
          View All Pending
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Pending</span>
          <span className="stat-value stat-value-warning">{applications.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Approved</span>
          <span className="stat-value stat-value-success">{approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Rejected</span>
          <span className="stat-value stat-value-error">{rejected}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="card-title">Application Status</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {pieData.map((item, i) => (
              <div key={item.name} className="pie-legend-item">
                <span className="pie-dot" style={{ background: COLORS[i] }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Recent Applications</h3>
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <p className="empty-state">{error}</p>
          ) : applications.length === 0 ? (
            <p className="empty-state">No pending applications.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Income</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id}>
                      <td className="td-id">#{app.id}</td>
                      <td className="td-amount">${app.amount.toLocaleString()}</td>
                      <td className="td-purpose">{app.purpose}</td>
                      <td className="td-amount">${app.monthly_income.toLocaleString()}</td>
                      <td><Badge variant="warning">{app.status}</Badge></td>
                      <td>
                        <Link to={`/officer/review/${app.id}`} className="link-action">Review</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
