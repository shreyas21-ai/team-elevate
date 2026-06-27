import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Input } from '../../../components/ui/Input';
import { PasswordInput } from '../../../components/auth/PasswordInput';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { validateEmail, validatePassword } from '../../../utils/validators';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login, role, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    try {
      await login({ email, password });
      const userRole = localStorage.getItem('role') || role;
      if (userRole === 'customer') navigate('/customer/dashboard', { replace: true });
      else if (userRole === 'officer') navigate('/officer/dashboard', { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">LoanFlow</div>
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Alert type="error">{apiError}</Alert>

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="login-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <a href="/forgot-password" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" loading={loading} className="login-btn">
            Sign In
          </Button>
        </form>

        <p className="login-footer">
          © {new Date().getFullYear()} LoanFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};
