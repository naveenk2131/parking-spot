import React, { useState } from 'react';
import api from '../../services/api';

export default function OwnerBookingsPage() {
  const [passCode, setPassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await api.post('/bookings/check-in', { passCode });
      setResult(res.data.data.reservation);
      setPassCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Manage Bookings & Check-In</h2>

      <div className="row">
        <div className="col-md-6">
          <div className="ps-card">
            <div className="ps-card-header bg-dark text-white">
              <h5 className="mb-0">Manual Check-In</h5>
            </div>
            <div className="ps-card-body">
              <form onSubmit={handleCheckIn}>
                <div className="mb-3">
                  <label className="form-label">Pass Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter booking pass code (e.g. PS-XXXXX)"
                    value={passCode}
                    onChange={(e) => setPassCode(e.target.value.toUpperCase())}
                    required
                  />
                  <div className="form-text">In a real app, this would also support QR scanning via device camera.</div>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Check-In'}
                </button>
              </form>

              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

              {result && (
                <div className="alert alert-success mt-3 mb-0">
                  <h6 className="fw-bold"><i className="bi bi-check-circle-fill me-2"></i>Check-in Successful</h6>
                  <ul className="mb-0 small">
                    <li>Slot: {result.parkingSlot.slotNumber}</li>
                    <li>Vehicle: {result.vehicle?.licensePlate || 'Unknown'}</li>
                    <li>Time: {new Date(result.actualCheckIn).toLocaleTimeString()}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
