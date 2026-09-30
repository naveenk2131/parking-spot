import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { getErrorMessage } from '../utilities/helpers';

export default function LoginPage() {
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
        role === 'owner' ? '/owner' : '/'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--ps-background)' }}>
      {/* Left side: Form */}
      <div className="d-flex flex-column justify-content-center px-4 col-12 col-lg-5" style={{ backgroundColor: 'var(--ps-surface)', borderRight: '1px solid var(--ps-border)' }}>
        <div className="w-100 mx-auto animate-fade-in" style={{ maxWidth: '400px' }}>
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 mb-5">
            <i className="bi bi-car-front-fill text-accent fs-3"></i>
            <span className="fs-3 fw-bold text-primary">ParkingSpot</span>
          </Link>
          
          <h2 className="mb-2">Welcome back</h2>
          <p className="text-muted mb-4">Sign in to manage your parking.</p>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
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
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0" htmlFor="login-password">Password</label>
                <a href="#!" className="text-decoration-none text-accent" style={{ fontSize: '0.875rem' }}>Forgot password?</a>
              </div>
              <div className="input-group">
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
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary bg-transparent border-start-0"
                  style={{ borderColor: 'var(--ps-border)' }}
                  onClick={() => setShowPassword(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary w-100 mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Don't have an account? </span>
            <Link to="/register" className="text-accent fw-bold text-decoration-none" id="go-to-register-btn">
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* Right side: Visual (Desktop Only) */}
      <div className="d-none d-lg-flex col-lg-7 flex-column justify-content-center align-items-center position-relative overflow-hidden p-5">
        {/* Background decorative pattern */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 150%, var(--ps-accent) 0%, transparent 50%), radial-gradient(circle at 80% -50%, var(--ps-primary-light) 0%, transparent 50%)',
          opacity: 0.1, zIndex: 0
        }}></div>
        
        <div className="z-1 text-center" style={{ maxWidth: '480px' }}>
          <i className="bi bi-shield-check text-primary mb-4" style={{ fontSize: '4rem' }}></i>
          <h2 className="mb-3">Secure, Verified Parking</h2>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>
            All locations on the ParkingSpot platform are verified for security, accessibility, and strict adherence to reservations.
          </p>
        </div>
      </div>
    </div>
  );
}
