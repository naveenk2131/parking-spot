import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ps-gray-50)' }}>
    <div className="text-center">
      <div style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '1rem' }}>🅿️</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--ps-gray-800)' }}>404</h1>
      <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Page not found</h2>
      <p className="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary" id="404-home-btn">Go Home</Link>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ps-gray-50)' }}>
    <div className="text-center">
      <div style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '1rem' }}>🔒</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--ps-gray-800)' }}>Unauthorized</h1>
      <p className="text-muted mb-4">You don't have permission to access this page.</p>
      <Link to="/" className="btn btn-primary" id="401-home-btn">Go Home</Link>
    </div>
  </div>
);

export { NotFoundPage, UnauthorizedPage };
