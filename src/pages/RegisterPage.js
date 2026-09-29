import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { getErrorMessage } from '../utilities/helpers';

const roleOptions = [
  { value: 'commuter', icon: '🚗', name: 'Commuter', desc: 'Find & book parking' },
  { value: 'owner', icon: '🏢', name: 'Parking Owner', desc: 'List & manage spaces' },
];

const RegisterPage = () => {
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
    if (score <= 2) return { level: score, label: 'Weak', color: '#dc2626' };
    if (score === 3) return { level: score, label: 'Fair', color: '#d97706' };
    if (score === 4) return { level: score, label: 'Good', color: '#059669' };
    return { level: score, label: 'Strong', color: '#059669' };
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
      const dest = role === 'owner' ? '/owner' : '/commuter';
      navigate(dest, { replace: true });
    } catch (err) {
      // Handle validation errors from backend
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
    <div className="ps-auth-page" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="ps-auth-card animate-fade-in-up" style={{ maxWidth: 520 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="ps-auth-logo">
            Parking<span>Spot</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.25rem' }}>
            Create your account
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Join ParkingSpot — it's free to get started
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-4">
          <label className="form-label">I want to</label>
          <div className="ps-role-selector">
            {roleOptions.map(r => (
              <div
                key={r.value}
                className={`ps-role-option${role === r.value ? ' selected' : ''}`}
                onClick={() => setRole(r.value)}
                id={`role-select-${r.value}`}
              >
                <div className="role-icon">{r.icon}</div>
                <div className="role-name">{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ps-gray-500)', marginTop: '0.15rem' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Row */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label" htmlFor="reg-first-name">First Name</label>
              <input
                id="reg-first-name"
                type="text"
                name="firstName"
                className={`form-control${fieldErrors.firstName ? ' is-invalid' : ''}`}
                placeholder="Jane"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
              {fieldErrors.firstName && <div className="invalid-feedback">{fieldErrors.firstName}</div>}
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="reg-last-name">Last Name</label>
              <input
                id="reg-last-name"
                type="text"
                name="lastName"
                className={`form-control${fieldErrors.lastName ? ' is-invalid' : ''}`}
                placeholder="Smith"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
              {fieldErrors.lastName && <div className="invalid-feedback">{fieldErrors.lastName}</div>}
            </div>
          </div>

          {/* Business Name (owner only) */}
          {role === 'owner' && (
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-business-name">Business / Facility Name</label>
              <input
                id="reg-business-name"
                type="text"
                name="businessName"
                className="form-control"
                placeholder="e.g. Downtown Parking LLC"
                value={formData.businessName}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="reg-phone">Phone Number <span className="text-muted fw-normal">(optional)</span></label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              className="form-control"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="ps-password-field">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-control${fieldErrors.password ? ' is-invalid' : ''}`}
                placeholder="Min. 8 chars, uppercase, number"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
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
            {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}

            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-2">
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: n <= passwordStrength.level ? passwordStrength.color : 'var(--ps-gray-200)',
                      transition: 'background 0.3s',
                    }}></div>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: passwordStrength.color }}>{passwordStrength.label} password</div>
              </div>
            )}
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary w-100 btn-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <><span className="ps-spinner me-2"></span> Creating account...</>
            ) : `Create ${role === 'owner' ? 'Owner' : 'Commuter'} Account`}
          </button>
        </form>

        <div className="ps-divider"><span>Already have an account?</span></div>

        <Link to="/login" className="btn btn-outline-primary w-100" id="go-to-login-btn">
          Sign In
        </Link>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.8rem' }}>
          By creating an account, you agree to our{' '}
          <a href="#!" style={{ color: 'var(--ps-primary)' }}>Terms of Service</a> and{' '}
          <a href="#!" style={{ color: 'var(--ps-primary)' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
