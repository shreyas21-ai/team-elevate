import type { LoginCredentials, AuthResponse } from '../types';

const API_URL = 'http://localhost:5000/api/v1';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Invalid Credentials' }));
    throw new Error(error.message || 'Invalid Credentials');
  }

  return response.json();
};
