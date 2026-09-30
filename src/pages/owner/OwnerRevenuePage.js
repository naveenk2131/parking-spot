import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function OwnerRevenuePage() {
  const [dashboard, setDashboard] = useState(null);
  const [insights, setInsights] = useState(null);
  const [topSlots, setTopSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulator State
  const [lots, setLots] = useState([]);
  const [simLot, setSimLot] = useState('');
  const [scenarioPrice, setScenarioPrice] = useState(20);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, insRes, lotsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/insights'),
        api.get('/parking/my-lots')
      ]);
      setDashboard(dashRes.data.data.dashboard);
      setInsights(insRes.data.data.insights);
      setTopSlots(insRes.data.data.topSlots);
      setLots(lotsRes.data.data.parkingLots);
      if (lotsRes.data.data.parkingLots.length > 0) {
        setSimLot(lotsRes.data.data.parkingLots[0]._id);
        setScenarioPrice(lotsRes.data.data.parkingLots[0].pricing?.baseRate || 20);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateRevenue = async () => {
    if (!simLot) return;
    setSimulating(true);
    try {
      const res = await api.post('/analytics/simulate-revenue', {
        lotId: simLot,
        scenarioPrice: Number(scenarioPrice)
      });
      setSimResult(res.data.data);
    } catch (error) {
      alert('Failed to simulate revenue');
    } finally {
      setSimulating(false);
    }
  };

  const processNoShows = async () => {
    // Assuming owner has at least one lot, we'll just process the first one for demo purposes
    // In a real app, you would select the lot first.
    try {
      const lotsRes = await api.get('/parking/my-lots');
      if (lotsRes.data.data.parkingLots.length > 0) {
        const lotId = lotsRes.data.data.parkingLots[0]._id;
        const res = await api.post(`/analytics/${lotId}/no-shows`);
        alert(res.data.message);
        fetchData();
      }
    } catch (error) {
      alert('Failed to process no-shows');
    }
  };

  const processOverstays = async () => {
    try {
      const lotsRes = await api.get('/parking/my-lots');
      if (lotsRes.data.data.parkingLots.length > 0) {
        const lotId = lotsRes.data.data.parkingLots[0]._id;
        const res = await api.post(`/analytics/${lotId}/overstays`);
        alert(res.data.message);
        fetchData();
      }
    } catch (error) {
      alert('Failed to process overstays');
    }
  };

  if (loading) return <div className="container mt-4">Loading dashboard...</div>;
  if (!dashboard) return <div className="container mt-4">Failed to load data.</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Revenue & Analytics</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-warning btn-sm" onClick={processNoShows}>Run No-Show Check</button>
          <button className="btn btn-outline-danger btn-sm" onClick={processOverstays}>Run Overstay Check</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="ps-card h-100 border-0 bg-primary text-white shadow-sm">
            <div className="ps-card-body">
              <h6 className="text-uppercase opacity-75 mb-3">Today's Earnings</h6>
              <h1 className="display-5 fw-bold mb-0">₹{dashboard.today?.totalRevenue?.toFixed(2) || '0.00'}</h1>
              <div className="mt-3 opacity-75 small">{dashboard.today?.totalBookings || 0} Bookings</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="ps-card h-100 border-0 bg-dark text-white shadow-sm">
            <div className="ps-card-body">
              <h6 className="text-uppercase opacity-75 mb-3">This Week</h6>
              <h1 className="display-5 fw-bold mb-0">₹{dashboard.week?.totalRevenue?.toFixed(2) || '0.00'}</h1>
              <div className="mt-3 opacity-75 small">{dashboard.week?.totalBookings || 0} Bookings</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="ps-card h-100 border-0 bg-light shadow-sm">
            <div className="ps-card-body">
              <h6 className="text-uppercase text-muted mb-3">This Month</h6>
              <h1 className="display-5 fw-bold text-dark mb-0">₹{dashboard.month?.totalRevenue?.toFixed(2) || '0.00'}</h1>
              <div className="mt-3 text-muted small">{dashboard.month?.totalBookings || 0} Bookings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Quality Metrics */}
        <div className="col-md-6">
          <div className="ps-card h-100">
            <div className="ps-card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold">Performance Metrics</h5>
            </div>
            <div className="ps-card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted">Average Booking Value</span>
                  <span className="fw-bold">₹{dashboard.month?.avgBookingValue?.toFixed(2) || '0.00'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted">Avg Parking Duration</span>
                  <span className="fw-bold">{dashboard.month?.totalDuration ? (dashboard.month.totalDuration / dashboard.month.totalBookings).toFixed(1) : 0} hrs</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted">Cancellation Rate</span>
                  <span className={`fw-bold text-${dashboard.cancellationRate > 10 ? 'danger' : 'success'}`}>{dashboard.cancellationRate}%</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0">
                  <span className="text-muted">No-Show Rate</span>
                  <span className={`fw-bold text-${dashboard.noShowRate > 5 ? 'danger' : 'success'}`}>{dashboard.noShowRate}%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Intelligence Insights */}
        <div className="col-md-6">
          <div className="ps-card h-100 border-info">
            <div className="ps-card-header bg-info text-dark">
              <h5 className="mb-0 fw-bold"><i className="bi bi-lightbulb-fill me-2"></i>Automated Insights</h5>
            </div>
            <div className="ps-card-body">
              <ul className="mb-0 ps-3">
                {insights && insights.map((ins, i) => (
                  <li key={i} className="mb-2 text-muted">{ins}</li>
                ))}
              </ul>
              
              <h6 className="fw-bold mt-4 mb-3">Top Utilized Slots</h6>
              <div className="d-flex flex-wrap gap-2">
                {topSlots.map((ts, i) => (
                  <span key={i} className="badge bg-secondary text-white p-2">
                    {ts._id?.slotNumber} <small className="opacity-75">({ts.uses} uses)</small>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Simulator */}
      <div className="row mt-4 mb-5">
        <div className="col-12">
          <div className="ps-card border-0 shadow-sm" style={{ background: 'linear-gradient(to right, var(--ps-primary), var(--ps-primary-light))', color: 'white' }}>
            <div className="ps-card-header bg-transparent border-bottom border-light border-opacity-25 py-3">
              <h5 className="mb-0 fw-bold"><i className="bi bi-calculator me-2"></i>Revenue Simulator</h5>
            </div>
            <div className="ps-card-body">
              <p className="opacity-75 mb-4">Test potential pricing scenarios based on your historical booking data.</p>
              
              <div className="row g-4 align-items-center">
                <div className="col-md-3">
                  <label className="form-label text-white opacity-75">Parking Lot</label>
                  <select className="form-select bg-dark text-white border-secondary" value={simLot} onChange={e => {
                    setSimLot(e.target.value);
                    const l = lots.find(x => x._id === e.target.value);
                    if (l) setScenarioPrice(l.pricing?.baseRate || 20);
                  }}>
                    {lots.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-white opacity-75">Scenario Price ($/hr)</label>
                  <input type="number" className="form-control bg-dark text-white border-secondary" value={scenarioPrice} onChange={e => setScenarioPrice(e.target.value)} />
                </div>
                <div className="col-md-3 mt-auto">
                  <button className="btn btn-accent w-100 mb-1" onClick={handleSimulateRevenue} disabled={simulating || !simLot}>
                    {simulating ? 'Simulating...' : 'Run Scenario'}
                  </button>
                </div>
              </div>

              {simResult && (
                <div className="mt-4 bg-white bg-opacity-10 rounded p-4">
                  <div className="row text-center">
                    <div className="col-md-4 border-end border-light border-opacity-25">
                      <span className="text-uppercase small opacity-75 d-block mb-1">Current Estimated</span>
                      <h3 className="fw-bold mb-0">₹{simResult.currentEstimated?.toFixed(2)}</h3>
                    </div>
                    <div className="col-md-4 border-end border-light border-opacity-25">
                      <span className="text-uppercase small text-warning fw-bold d-block mb-1">Scenario Estimated</span>
                      <h3 className="fw-bold text-warning mb-0">₹{simResult.scenarioEstimated?.toFixed(2)}</h3>
                    </div>
                    <div className="col-md-4">
                      <span className="text-uppercase small opacity-75 d-block mb-1">Impact</span>
                      <h3 className={`fw-bold mb-0 ${simResult.difference > 0 ? 'text-success' : 'text-danger'}`}>
                        {simResult.difference > 0 ? '+' : ''}${simResult.difference?.toFixed(2)}
                      </h3>
                    </div>
                  </div>
                  <div className="text-center mt-3 pt-3 border-top border-light border-opacity-25">
                    <small className="opacity-75"><i className="bi bi-info-circle me-1"></i> {simResult.note} Based on {simResult.historicalBookingsCount} past bookings.</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
