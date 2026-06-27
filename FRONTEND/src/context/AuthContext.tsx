import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { loginUser } from '../services/authService';
import type { LoginCredentials } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedName = localStorage.getItem('user');

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole as UserRole);
      setUser({ name: storedName || '', email: '', role: storedRole as UserRole });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const data = await loginUser(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', data.name);

      setToken(data.token);
      setRole(data.role);
      setUser({ name: data.name, email: credentials.email, role: data.role });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
