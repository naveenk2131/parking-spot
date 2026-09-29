import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { getErrorMessage } from '../utilities/helpers';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      const role = result.user.role;
      const destination = from || (
        role === 'admin' ? '/admin' :
        role === 'owner' ? '/owner' : '/commuter'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ps-auth-page">
      <div className="ps-auth-card animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="ps-auth-logo">
            Parking<span>Spot</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.25rem' }}>
            Welcome back
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Sign in to your ParkingSpot account
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0" htmlFor="login-password">Password</label>
              <a href="#!" style={{ fontSize: '0.8125rem', color: 'var(--ps-primary)' }}>Forgot password?</a>
            </div>
            <div className="ps-password-field">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                className="ps-password-toggle"
                onClick={() => setShowPassword(p => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary w-100 btn-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <><span className="ps-spinner me-2"></span> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="ps-divider"><span>New to ParkingSpot?</span></div>

        <Link to="/register" className="btn btn-outline-primary w-100" id="go-to-register-btn">
          Create an account
        </Link>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.8rem' }}>
          By signing in, you agree to our{' '}
          <a href="#!" style={{ color: 'var(--ps-primary)' }}>Terms</a> and{' '}
          <a href="#!" style={{ color: 'var(--ps-primary)' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
