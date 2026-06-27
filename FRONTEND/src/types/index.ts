export type UserRole = 'customer' | 'officer';

export type LoanStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id?: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  name: string;
  user_id: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
}

export interface LoanApplication {
  id: number;
  user_id: number;
  amount: number;
  purpose: string;
  monthly_income: number;
  status: LoanStatus;
  risk_score?: number;
  reviewed_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface LoanApplicationInput {
  amount: number;
  purpose: string;
  monthly_income: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
