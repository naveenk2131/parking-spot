import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function OwnerOccupancyPage() {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [occupancy, setOccupancy] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  useEffect(() => {
    if (selectedLot) {
      fetchOccupancyData(selectedLot);
    }
  }, [selectedLot]);

  const fetchLots = async () => {
    try {
      const res = await api.get('/parking/my-lots');
      setLots(res.data.data.parkingLots);
      if (res.data.data.parkingLots.length > 0) {
        setSelectedLot(res.data.data.parkingLots[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch lots');
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupancyData = async (lotId) => {
    try {
      const [occRes, priceRes] = await Promise.all([
        api.get(`/analytics/${lotId}/occupancy`),
        api.get(`/analytics/${lotId}/pricing-recommendation`)
      ]);
      setOccupancy(occRes.data.data.occupancy);
      setPricingInfo(priceRes.data.data.pricing);
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const handleSimulate = async (action) => {
    if (!selectedLot) return;
    try {
      const res = await api.post(`/analytics/${selectedLot}/simulate`, { action, count: 1 });
      alert(res.data.message);
      fetchOccupancyData(selectedLot);
    } catch (error) {
      alert(error.response?.data?.message || 'Simulation failed');
    }
  };

  if (loading) return <div className="container mt-4">Loading occupancy...</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Live Occupancy & Pricing</h2>
        <select className="form-select w-auto" value={selectedLot} onChange={(e) => setSelectedLot(e.target.value)}>
          <option value="" disabled>Select Parking Lot</option>
          {lots.map(lot => <option key={lot._id} value={lot._id}>{lot.name}</option>)}
        </select>
      </div>

      {occupancy && pricingInfo ? (
        <div className="row g-4">
          
          {/* Live Occupancy Dashboard */}
          <div className="col-lg-8">
            <div className="ps-card h-100">
              <div className="ps-card-header bg-dark text-white">
                <h5 className="mb-0">Live Slot Status</h5>
              </div>
              <div className="ps-card-body">
                <div className="row text-center mb-4">
                  <div className="col-4 border-end">
                    <h1 className="fw-bold text-primary">{occupancy.total}</h1>
                    <span className="text-muted small text-uppercase">Total Slots</span>
                  </div>
                  <div className="col-4 border-end">
                    <h1 className="fw-bold text-success">{occupancy.available}</h1>
                    <span className="text-muted small text-uppercase">Available</span>
                  </div>
                  <div className="col-4">
                    <h1 className="fw-bold text-danger">{occupancy.occupied + occupancy.reserved}</h1>
                    <span className="text-muted small text-uppercase">In Use</span>
                  </div>
                </div>

                <div className="progress mb-3" style={{ height: '25px' }}>
                  <div className="progress-bar bg-success" style={{ width: `${(occupancy.available/occupancy.total)*100}%` }}>Available</div>
                  <div className="progress-bar bg-warning" style={{ width: `${(occupancy.reserved/occupancy.total)*100}%` }}>Reserved</div>
                  <div className="progress-bar bg-danger" style={{ width: `${(occupancy.occupied/occupancy.total)*100}%` }}>Occupied</div>
                  <div className="progress-bar bg-secondary" style={{ width: `${(occupancy.maintenance/occupancy.total)*100}%` }}>Maint.</div>
                </div>
                <div className="text-center text-muted small">
                  Current Occupancy: <strong>{occupancy.occupancyPercent}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Simulator */}
          <div className="col-lg-4">
            <div className="ps-card h-100 border-warning">
              <div className="ps-card-header bg-warning text-dark">
                <h5 className="mb-0"><i className="bi bi-joystick me-2"></i>Demo Simulator</h5>
              </div>
              <div className="ps-card-body d-flex flex-column justify-content-center">
                <p className="small text-muted mb-4">Simulate physical hardware triggers (e.g. boom barrier or camera sensors) for presentation purposes.</p>
                <div className="d-grid gap-3">
                  <button className="btn btn-danger btn-lg" onClick={() => handleSimulate('enter')}>
                    <i className="bi bi-car-front-fill me-2"></i> Vehicle Entered
                  </button>
                  <button className="btn btn-success btn-lg" onClick={() => handleSimulate('exit')}>
                    <i className="bi bi-car-front me-2"></i> Vehicle Exited
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Pricing (Parking Intelligence) */}
          <div className="col-12">
            <div className="ps-card bg-light border-0 shadow-sm">
              <div className="ps-card-body d-flex align-items-center">
                <div className="me-4 text-primary">
                  <i className="bi bi-lightning-charge-fill display-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold text-primary mb-1">Parking Intelligence</h5>
                  <p className="mb-2 text-muted">{pricingInfo.recommendation}</p>
                  <div className="d-flex gap-4 mt-3">
                    <div>
                      <span className="small text-muted d-block text-uppercase">Demand Level</span>
                      <span className="fw-bold">{pricingInfo.demandLevel}</span>
                    </div>
                    <div>
                      <span className="small text-muted d-block text-uppercase">Current Base</span>
                      <span className="fw-bold">₹{pricingInfo.currentBasePrice}/hr</span>
                    </div>
                    <div>
                      <span className="small text-muted d-block text-uppercase">Suggested</span>
                      <span className="fw-bold text-success fs-5">₹{pricingInfo.suggestedPrice}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="alert alert-secondary">Please select a lot to view occupancy.</div>
      )}
    </div>
  );
}
