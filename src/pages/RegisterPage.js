import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { getErrorMessage } from '../utilities/helpers';

const roleOptions = [
  { value: 'commuter', icon: 'bi-car-front', name: 'Commuter', desc: 'Find & book parking' },
  { value: 'owner', icon: 'bi-building', name: 'Parking Owner', desc: 'List & manage spaces' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') === 'owner' ? 'owner' : 'commuter');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'owner') setRole('owner');
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    if (error) setError('');
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: 'var(--ps-occupied)' };
    if (score === 3) return { level: score, label: 'Fair', color: 'var(--ps-reserved)' };
    if (score >= 4) return { level: score, label: 'Strong', color: 'var(--ps-available)' };
    return { level: score, label: 'Strong', color: 'var(--ps-available)' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role,
      phone: formData.phone.trim() || undefined,
    };
    if (role === 'owner' && formData.businessName.trim()) {
      payload.businessName = formData.businessName.trim();
    }

    try {
      await register(payload);
      const dest = role === 'owner' ? '/owner' : '/';
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        const errs = {};
        err.response.data.errors.forEach(e => { errs[e.field] = e.message; });
        setFieldErrors(errs);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--ps-background)' }}>
      {/* Left side: Form */}
      <div className="d-flex flex-column justify-content-center px-4 col-12 col-lg-5 py-5 overflow-auto" style={{ backgroundColor: 'var(--ps-surface)', borderRight: '1px solid var(--ps-border)' }}>
        <div className="w-100 mx-auto animate-fade-in" style={{ maxWidth: '420px' }}>
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-car-front-fill text-accent fs-3"></i>
            <span className="fs-3 fw-bold text-primary">ParkingSpot</span>
          </Link>
          
          <h2 className="mb-2">Create Account</h2>
          <p className="text-muted mb-4">Join ParkingSpot to manage your parking needs.</p>

          {/* Role Selector */}
          <div className="mb-4">
            <label className="form-label mb-2">I want to...</label>
            <div className="row g-2">
              {roleOptions.map(r => (
                <div key={r.value} className="col-6">
                  <div 
                    onClick={() => setRole(r.value)}
                    className={`ps-card p-3 text-center h-100 ${role === r.value ? 'border-primary bg-light' : ''}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: role === r.value ? 'var(--ps-primary)' : 'var(--ps-border)', borderWidth: role === r.value ? '2px' : '1px' }}
                  >
                    <i className={`bi ${r.icon} fs-4 mb-2 ${role === r.value ? 'text-primary' : 'text-muted'}`}></i>
                    <div className="fw-bold text-main" style={{ fontSize: '0.9rem' }}>{r.name}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label" htmlFor="reg-first-name">First Name</label>
                <input
                  id="reg-first-name"
                  type="text"
                  name="firstName"
                  className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="reg-last-name">Last Name</label>
                <input
                  id="reg-last-name"
                  type="text"
                  name="lastName"
                  className={`form-control ${fieldErrors.lastName ? 'is-invalid' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {role === 'owner' && (
              <div className="mb-3">
                <label className="form-label" htmlFor="reg-business-name">Business / Facility Name</label>
                <input
                  id="reg-business-name"
                  type="text"
                  name="businessName"
                  className="form-control"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="reg-phone">Phone Number <span className="text-muted fw-normal">(optional)</span></label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-group">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary bg-transparent border-start-0"
                  style={{ borderColor: 'var(--ps-border)' }}
                  onClick={() => setShowPassword(p => !p)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="d-flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: n <= passwordStrength.level ? passwordStrength.color : 'var(--ps-border)',
                        transition: 'background 0.3s'
                      }}></div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: passwordStrength.color }}>{passwordStrength.label}</div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Creating account...</>
              ) : `Create ${role === 'owner' ? 'Owner' : 'Commuter'} Account`}
            </button>
          </form>

          <div className="text-center">
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>Already have an account? </span>
            <Link to="/login" className="text-accent fw-bold text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Right side: Visual (Desktop Only) */}
      <div className="d-none d-lg-flex col-lg-7 flex-column justify-content-center align-items-center position-relative overflow-hidden p-5" style={{ backgroundColor: 'var(--ps-primary)' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, var(--ps-accent) 0%, transparent 40%), radial-gradient(circle at 20% 80%, var(--ps-primary-light) 0%, transparent 40%)',
          opacity: 0.2, zIndex: 0
        }}></div>
        
        <div className="z-1 text-center text-white" style={{ maxWidth: '480px' }}>
          <i className="bi bi-geo-alt mb-4 d-block" style={{ fontSize: '4rem', color: 'var(--ps-accent)' }}></i>
          <h2 className="mb-3 text-white">Find Your Space</h2>
          <p className="opacity-75" style={{ fontSize: '1.125rem' }}>
            Join our network to access thousands of guaranteed parking spaces, or list your own to start earning immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
