import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { applyLoan } from '../../../services/loanService';

export const CustomerApply = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || !purpose || !monthlyIncome) {
      setError('All fields are required');
      return;
    }

    const amountNum = parseFloat(amount);
    const incomeNum = parseFloat(monthlyIncome);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid loan amount');
      return;
    }
    if (isNaN(incomeNum) || incomeNum <= 0) {
      setError('Please enter a valid monthly income');
      return;
    }

    setLoading(true);
    try {
      await applyLoan({ amount: amountNum, purpose, monthly_income: incomeNum });
      navigate('/customer/history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h2>Apply for Loan</h2>
      <p>Fill out the form below to submit a new loan application.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 24, marginTop: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert type="error">{error}</Alert>

        <Input
          id="amount"
          label="Loan Amount ($)"
          type="number"
          placeholder="e.g. 10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
        />

        <div className="input-group">
          <label htmlFor="purpose">Purpose of Loan</label>
          <textarea
            id="purpose"
            placeholder="e.g. Home renovation, business expansion..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
            style={{
              padding: '10px 14px',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <Input
          id="income"
          label="Monthly Income ($)"
          type="number"
          placeholder="e.g. 5000"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          min={1}
        />

        <Button type="submit" loading={loading} style={{ marginTop: 8 }}>
          Submit Application
        </Button>
      </form>
    </div>
  );
};
