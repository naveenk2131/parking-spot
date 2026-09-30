import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0, owners: 0, lots: 0, slots: 0, activeBookings: 0, totalBookings: 0, gmv: 0, platformRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/analytics/admin-dashboard', { withCredentials: true });
        setStats(res.data.data.dashboard);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="container mt-4">Loading platform data...</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Platform Overview</h2>
        <button className="btn btn-outline-dark btn-sm"><i className="bi bi-download me-2"></i>Export Report</button>
      </div>

      <div className="row g-4 mb-4">
        {/* Core Metrics */}
        <div className="col-md-3">
          <div className="ps-card border-0 bg-primary text-white shadow-sm h-100">
            <div className="ps-card-body">
              <span className="text-uppercase small opacity-75">Gross Booking Value</span>
              <h2 className="fw-bold mb-0">₹{stats.gmv.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ps-card border-0 bg-dark text-white shadow-sm h-100">
            <div className="ps-card-body">
              <span className="text-uppercase small opacity-75">Platform Revenue</span>
              <h2 className="fw-bold mb-0 text-success">₹{stats.platformRevenue.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ps-card border-0 bg-light shadow-sm h-100">
            <div className="ps-card-body">
              <span className="text-uppercase small text-muted">Total Bookings</span>
              <h2 className="fw-bold mb-0 text-dark">{stats.totalBookings.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ps-card border-0 bg-light shadow-sm h-100">
            <div className="ps-card-body">
              <span className="text-uppercase small text-muted">Active Bookings</span>
              <h2 className="fw-bold mb-0 text-primary">{stats.activeBookings.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="ps-card">
            <div className="ps-card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Network Infrastructure</h5>
            </div>
            <div className="ps-card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Parking Lots</span>
                  <span className="fw-bold">{stats.lots}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Total Mapped Slots</span>
                  <span className="fw-bold">{stats.slots.toLocaleString()}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="ps-card">
            <div className="ps-card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">User Base</h5>
            </div>
            <div className="ps-card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Registered Commuters</span>
                  <span className="fw-bold">{stats.users.toLocaleString()}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Verified Owners</span>
                  <span className="fw-bold">{stats.owners}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="ps-card mt-4">
        <div className="ps-card-header bg-dark text-white">
          <h5 className="mb-0">Global Platform Settings</h5>
        </div>
        <div className="ps-card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="fw-bold">Default Commission Rate</label>
              <p className="text-muted small mb-0">Applies to all new parking lots created on the platform.</p>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <input type="number" className="form-control" defaultValue="12" min="10" max="15" />
                <span className="input-group-text">%</span>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <button className="btn btn-primary" onClick={() => alert('Commission rate updated platform-wide.')}>Update Configuration</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
