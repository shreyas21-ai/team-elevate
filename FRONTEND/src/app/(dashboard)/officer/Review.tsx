import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPendingApplications, reviewLoan } from '../../../services/loanService';
import type { LoanApplication } from '../../../types';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';

export const OfficerReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPendingApplications()
      .then((apps) => {
        const found = apps.find((a) => a.id === Number(id));
        if (found) setApplication(found);
        else setError('Application not found');
      })
      .catch(() => setError('Failed to load application'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    setActionLoading(true);
    setError('');
    try {
      const riskScore = action === 'approved' ? Math.floor(Math.random() * 40) + 60 : undefined;
      await reviewLoan(Number(id), action, riskScore);
      navigate('/officer/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: 60 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="page">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  if (!application) return null;

  const riskScore = application.risk_score ?? Math.min(100, Math.round((application.monthly_income / application.amount) * 100));

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h2>Review Application #{application.id}</h2>
      <p>Review the loan details and make a decision.</p>

      <Alert type="error">{error}</Alert>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginTop: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Loan Amount</label>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>${application.amount.toLocaleString()}</p>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Monthly Income</label>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>${application.monthly_income.toLocaleString()}</p>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Purpose</label>
            <p style={{ fontSize: '1rem', color: '#475569' }}>{application.purpose}</p>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status</label>
            <div style={{ marginTop: 4 }}><Badge variant="warning">{application.status}</Badge></div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Risk Score</label>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: riskScore >= 70 ? '#16a34a' : riskScore >= 40 ? '#d97706' : '#dc2626' }}>
              {riskScore}/100
            </p>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Submitted</label>
            <p style={{ fontSize: '1rem', color: '#475569' }}>{new Date(application.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          <Button
            variant="secondary"
            loading={actionLoading}
            onClick={() => handleAction('rejected')}
            style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            Reject
          </Button>
          <Button
            loading={actionLoading}
            onClick={() => handleAction('approved')}
            style={{ flex: 1 }}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};
