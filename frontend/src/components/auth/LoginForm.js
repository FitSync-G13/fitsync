import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const quickLogin = async (email, password) => {
    setEmail(email);
    setPassword(password);
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">FitSync Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '600' }}>Quick Login:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => quickLogin('admin@fitsync.com', 'Admin@123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => quickLogin('trainer@fitsync.com', 'Trainer@123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem' }}
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => quickLogin('client@fitsync.com', 'Client@123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem' }}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => quickLogin('gym@fitsync.com', 'Gym@123')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem' }}
            >
              Gym Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
