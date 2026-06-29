import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { login as apiLogin, register as apiRegister } from '../services/api';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type Mode = 'login' | 'register';

export function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [specialty, setSpecialty] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address (e.g. name@example.com)');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        await apiRegister(email, password, fullName, role, specialty, roomNumber);
        setMode('login');
        setError('Registered successfully. Please log in.');
        setLoading(false);
        return;
      }

      const res = await apiLogin(email, password);
      login(res.user, res.token);
      navigate(res.user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">+</span>
          <h1>CareFlow</h1>
          <p>Hospital Queue Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>

          {error && <div className="login-error">{error}</div>}

          {mode === 'register' && (
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Dr. Smith"
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {mode === 'register' && (
            <>
              <div className="input-group">
                <label>Role</label>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => { setRole(e.target.value as 'patient' | 'doctor'); setError(''); }}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              {role === 'doctor' && (
                <>
                  <Input
                    label="Specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                    placeholder="e.g. Cardiology"
                  />
                  <Input
                    label="Room Number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    placeholder="e.g. A101"
                  />
                </>
              )}
            </>
          )}

          <Button type="submit" loading={loading} className="login-btn">
            {mode === 'login' ? 'Sign In' : 'Register'}
          </Button>

          <p className="login-toggle">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button type="button" className="link-btn" onClick={() => { setMode('register'); setError(''); }}>
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={() => { setMode('login'); setError(''); }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
