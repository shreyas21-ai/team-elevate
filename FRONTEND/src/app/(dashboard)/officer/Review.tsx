import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPendingApplications, reviewLoan } from '../../../services/loanService';
import type { LoanApplication } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../hooks/useToast';

export const OfficerReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      addToast(`Application #${id} ${action} successfully!`, 'success');
      navigate('/officer/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-narrow">
        <Skeleton width="300px" height="32px" />
        <Skeleton width="200px" height="20px" style={{ marginTop: 8 }} />
        <div className="card" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <Skeleton width="100px" height="16px" />
                <Skeleton width="140px" height="28px" style={{ marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
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
  const riskColor = riskScore >= 70 ? '#16a34a' : riskScore >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="page page-narrow">
      <h2>Review Application #{application.id}</h2>
      <p>Review the loan details and make a decision.</p>

      <Alert type="error">{error}</Alert>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="review-grid">
          <div className="review-field">
            <span className="review-label">Loan Amount</span>
            <span className="review-value-lg">${application.amount.toLocaleString()}</span>
          </div>
          <div className="review-field">
            <span className="review-label">Monthly Income</span>
            <span className="review-value-lg">${application.monthly_income.toLocaleString()}</span>
          </div>
          <div className="review-field review-field-full">
            <span className="review-label">Purpose</span>
            <span className="review-value">{application.purpose}</span>
          </div>
          <div className="review-field">
            <span className="review-label">Status</span>
            <Badge variant="warning">{application.status}</Badge>
          </div>
          <div className="review-field">
            <span className="review-label">Risk Score</span>
            <span className="review-value-lg" style={{ color: riskColor }}>{riskScore}/100</span>
          </div>
          <div className="review-field">
            <span className="review-label">Submitted</span>
            <span className="review-value">{new Date(application.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="review-actions">
          <Button
            variant="secondary"
            loading={actionLoading}
            onClick={() => handleAction('rejected')}
            className="btn-reject"
          >
            Reject
          </Button>
          <Button
            loading={actionLoading}
            onClick={() => handleAction('approved')}
            className="btn-approve"
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};
