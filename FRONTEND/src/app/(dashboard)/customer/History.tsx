import { useState, useEffect } from 'react';
import { getMyApplications } from '../../../services/loanService';
import type { LoanApplication } from '../../../types';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';

export const CustomerHistory = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusVariant = (status: string) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <div className="page">
      <h2>My Applications</h2>
      <p>View the status of all your loan applications.</p>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginTop: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spinner size="lg" /></div>
        ) : applications.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
            No applications found.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>ID</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Amount</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Purpose</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Monthly Income</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>#{app.id}</td>
                  <td style={{ padding: '12px 8px', fontSize: '0.9rem', fontWeight: 600 }}>${app.amount.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', fontSize: '0.9rem', color: '#475569' }}>{app.purpose}</td>
                  <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>${app.monthly_income.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <Badge variant={statusVariant(app.status)}>{app.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
