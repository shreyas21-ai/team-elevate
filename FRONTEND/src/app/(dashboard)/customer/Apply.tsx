import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { applyLoan } from '../../../services/loanService';
import { useToast } from '../../../hooks/useToast';

export const CustomerApply = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      addToast('Loan application submitted successfully!', 'success');
      navigate('/customer/history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-narrow">
      <h2>Apply for Loan</h2>
      <p>Fill out the form below to submit a new loan application.</p>

      <form onSubmit={handleSubmit} className="card form-card">
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
            className="textarea"
            placeholder="e.g. Home renovation, business expansion..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
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

        <Button type="submit" loading={loading} className="btn-full">
          Submit Application
        </Button>
      </form>
    </div>
  );
};
