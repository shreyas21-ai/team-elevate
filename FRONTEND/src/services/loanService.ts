import type { LoanApplication, LoanApplicationInput } from '../types';

const API_URL = 'http://localhost:5000/api/v1';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const applyLoan = async (data: LoanApplicationInput): Promise<LoanApplication> => {
  const response = await fetch(`${API_URL}/loans/apply`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return response.json();
};

export const getMyApplications = async (): Promise<LoanApplication[]> => {
  const response = await fetch(`${API_URL}/loans/my-applications`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch applications');
  return response.json();
};

export const getPendingApplications = async (): Promise<LoanApplication[]> => {
  const response = await fetch(`${API_URL}/loans/pending`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch pending applications');
  return response.json();
};

export const reviewLoan = async (id: number, action: 'approved' | 'rejected', risk_score?: number): Promise<LoanApplication> => {
  const response = await fetch(`${API_URL}/loans/${id}/action`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action, risk_score }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Action failed' }));
    throw new Error(err.message || 'Action failed');
  }
  return response.json();
};
