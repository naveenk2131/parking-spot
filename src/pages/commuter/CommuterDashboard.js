import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { formatDate } from '../../utilities/helpers';

const StatCard = ({ icon, label, value, sub, color = 'var(--ps-primary)' }) => (
  <div className="ps-stat-card">
    <div className="d-flex align-items-start justify-content-between mb-3">
      <div className="stat-icon" style={{ background: color + '15', color }}>
        {icon}
      </div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="mt-1 text-muted" style={{ fontSize: '0.8rem' }}>{sub}</div>}
  </div>
);

const CommuterDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <h1>Good morning, {user?.firstName}! 👋</h1>
          <p>Here's what's happening with your parking today.</p>
        </div>
        <Link to="/commuter/find-parking" className="btn btn-primary" id="dashboard-find-parking-btn">
          <i className="bi bi-search me-2"></i>Find Parking
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon="📋" label="Total Bookings" value="0" sub="All time" color="var(--ps-primary)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="🕐" label="Upcoming" value="0" sub="Next 7 days" color="#7c3aed" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="✅" label="Completed" value="0" sub="Total trips" color="var(--ps-success)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="💰" label="Total Spent" value="$0" sub="Lifetime" color="var(--ps-accent)" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="ps-card">
            <div className="ps-card-body">
              <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Quick Actions</h5>
              <div className="row g-3">
                {[
                  { icon: '🔍', title: 'Find Parking', desc: 'Search available spots near you', to: '/commuter/find-parking', btn: 'Search Now' },
                  { icon: '🚗', title: 'Add Vehicle', desc: 'Register your car for quick booking', to: '/commuter/vehicles', btn: 'Add Vehicle' },
                  { icon: '👤', title: 'Complete Profile', desc: 'Add your details for a better experience', to: '/commuter/profile', btn: 'Update Profile' },
                ].map((action, i) => (
                  <div key={i} className="col-md-4">
                    <div style={{
                      border: '1px solid var(--ps-gray-200)',
                      borderRadius: 'var(--ps-radius)',
                      padding: '1.25rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{action.icon}</div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{action.title}</div>
                      <div className="text-muted small flex-grow-1" style={{ marginBottom: '1rem' }}>{action.desc}</div>
                      <Link to={action.to} className="btn btn-outline-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                        {action.btn}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings (empty state) */}
      <div className="ps-card">
        <div className="ps-card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 style={{ fontWeight: 700, margin: 0 }}>Recent Bookings</h5>
            <Link to="/commuter/bookings" style={{ fontSize: '0.875rem', color: 'var(--ps-primary)' }}>View all</Link>
          </div>
          <div className="ps-empty-state">
            <div className="ps-empty-icon">📋</div>
            <h5>No bookings yet</h5>
            <p>Book your first parking spot to see it here.</p>
            <Link to="/commuter/find-parking" className="btn btn-primary btn-sm">Find Parking</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommuterDashboard;
