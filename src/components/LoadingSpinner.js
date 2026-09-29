import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClass = size === 'lg' ? 'ps-spinner-lg' : size === 'sm' ? 'ps-spinner' : 'ps-spinner';
  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3 py-5">
      <div className={`ps-spinner ${sizeClass}`}></div>
      {message && <p className="text-muted small mb-0">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
