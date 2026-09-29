import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { getInitials, getRoleInfo } from '../utilities/helpers';

const PublicNavbar = () => {
  return (
    <nav className="ps-navbar navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Parking<span>Spot</span>
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#publicNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="publicNav">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item"><a className="nav-link" href="#how-it-works">How it works</a></li>
            <li className="nav-item"><a className="nav-link" href="#benefits">Benefits</a></li>
            <li className="nav-item"><Link className="nav-link" to="/login">Sign in</Link></li>
            <li className="nav-item ms-2">
              <Link className="btn btn-primary btn-sm" to="/register">Get Started</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleInfo = getRoleInfo(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'owner') return '/owner';
    return '/commuter';
  };

  return (
    <nav className="ps-navbar navbar navbar-expand-lg sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand" to={getDashboardPath()}>
          Parking<span>Spot</span>
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* User avatar dropdown */}
          <div className="dropdown">
            <button
              className="btn d-flex align-items-center gap-2 btn-ghost"
              type="button"
              data-bs-toggle="dropdown"
              id="user-menu-btn"
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a56db, #3b82f6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}
              >
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="d-none d-md-block text-start">
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ps-gray-800)', lineHeight: 1.2 }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ps-gray-500)' }}>{roleInfo.label}</div>
              </div>
              <i className="bi bi-chevron-down" style={{ fontSize: '0.75rem', color: 'var(--ps-gray-400)' }}></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-ps-md" style={{ minWidth: 200 }}>
              <li>
                <div className="px-3 py-2 border-bottom">
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ps-gray-500)' }}>{user?.email}</div>
                </div>
              </li>
              <li><Link className="dropdown-item" to={`${getDashboardPath()}/profile`}>
                <i className="bi bi-person me-2"></i> Profile
              </Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { PublicNavbar, AppNavbar };
