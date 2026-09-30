import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import vehicleService from '../../services/vehicle.service';
import premiumServiceApi from '../../services/premiumService.service';

const SVC_CFG = {
  EV_CHARGING: { icon: 'bi-lightning-charge-fill', color: '#10b981', label: 'EV Charging', bg: '#d1fae5' },
  VALET:       { icon: 'bi-key-fill',             color: '#6366f1', label: 'Valet',       bg: '#ede9fe' },
  CAR_WASH:    { icon: 'bi-droplet-fill',          color: '#3b82f6', label: 'Car Wash',    bg: '#dbeafe' },
  PREMIUM_SLOT:{ icon: 'bi-star-fill',             color: '#f59e0b', label: 'Premium Slot',bg: '#fef9c3' },
};

export default function ParkingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [waitlisting, setWaitlisting] = useState(false);
  
  // Booking State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingParams, setBookingParams] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 2 // hours
  });
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [premiumServices, setPremiumServices] = useState([]);
  const [bookingService, setBookingService] = useState(null);
  const [serviceBooking, setServiceBooking] = useState({ startTime: '', endTime: '', packageName: '' });
  const [serviceBookingLoading, setServiceBookingLoading] = useState(false);
  const [serviceBookingMsg, setServiceBookingMsg] = useState('');

  useEffect(() => {
    fetchDetails();
    // Live Occupancy Polling
    const interval = setInterval(() => { fetchDetails(false); }, 15000);
    fetchVehicles();
    return () => clearInterval(interval);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookService = async (e) => {
    e.preventDefault();
    if (!bookingService) return;
    setServiceBookingLoading(true);
    setServiceBookingMsg('');
    try {
      const startDT = new Date(`${bookingParams.date}T${serviceBooking.startTime}:00`);
      const durationMs = (bookingService.duration || 60) * 60000;
      const endDT = new Date(startDT.getTime() + durationMs);
      await premiumServiceApi.bookService({
        serviceId: bookingService._id,
        startTime: startDT.toISOString(),
        endTime: endDT.toISOString(),
        vehicleId: selectedVehicle || undefined,
        selectedPackage: serviceBooking.packageName ? { name: serviceBooking.packageName } : undefined,
      });
      setServiceBookingMsg('✅ Service booked successfully!');
      setBookingService(null);
    } catch (err) {
      setServiceBookingMsg('❌ ' + (err.response?.data?.message || 'Failed to book service.'));
    } finally {
      setServiceBookingLoading(false);
    }
  };

  const fetchDetails = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/search/${id}`);
      setData(res.data.data);
      if (res.data.data.floors?.length > 0 && showLoading) {
        setSelectedFloorId(res.data.data.floors[0]._id);
      }
      if (res.data.data?.parkingLot?._id) {
        // Fetch premium services separately (avoid circular dependency)
        try {
          const svcRes = await premiumServiceApi.getLotServices(res.data.data.parkingLot._id);
          setPremiumServices((svcRes.data?.data?.services || []).filter(s => s.status === 'ACTIVE'));
        } catch (_) {}
      }
    } catch (error) {
      console.error('Failed to load parking details', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleService.getMyVehicles();
      const list = res.data?.data?.vehicles || res.data?.vehicles || [];
      setVehicles(list);
      if (list.length > 0) {
        const def = list.find(v => v.isDefault);
        setSelectedVehicle(def ? def._id : list[0]._id);
      }
    } catch (error) {
      console.error('Vehicle fetch failed', error);
    }
  }, []);


  const handleBookNow = async () => {
    if (!selectedSlot || !selectedVehicle) {
      return alert('Please select a slot and vehicle.');
    }
    
    // Calculate start and end times
    const startDT = new Date(`${bookingParams.date}T${bookingParams.startTime}:00`);
    const endDT = new Date(startDT.getTime() + bookingParams.duration * 60 * 60 * 1000);
    
    // Calculate price (simplified: base price 10/hr * duration)
    const pricePerHour = data.parkingLot?.pricing?.basePrice || 40;
    const totalAmount = pricePerHour * bookingParams.duration;

    try {
      const payload = {
        parkingLotId: data.parkingLot._id,
        parkingSlotId: selectedSlot._id,
        vehicleId: selectedVehicle,
        startTime: startDT.toISOString(),
        endTime: endDT.toISOString(),
        totalAmount
      };

      const res = await axios.post('http://localhost:5000/api/bookings', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const reservationId = res.data.data.reservation._id;
      navigate(`/commuter/checkout/${reservationId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedVehicle) {
      return alert('Please select a vehicle.');
    }
    setWaitlisting(true);
    try {
      await axios.post('http://localhost:5000/api/waitlist/join', {
        parkingLotId: data.parkingLot._id,
        requestedDate: bookingParams.date,
        requestedStartTime: bookingParams.startTime,
        requestedDuration: bookingParams.duration,
        vehicleId: selectedVehicle
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Successfully joined the waitlist!');
      navigate('/commuter/bookings'); // Waitlist is shown here
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setWaitlisting(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
  if (!data || !data.parkingLot) return <div className="container mt-4">Parking lot not found.</div>;

  const { parkingLot, floors } = data;
  const activeFloor = floors.find(f => f._id === selectedFloorId);
  const pricePerHour = parkingLot.pricing?.basePrice || 40;

  // Icon helper based on slot type
  const getSlotIcon = (type) => {
    if (type === 'EV') return 'bi-lightning-charge-fill text-accent';
    if (type === 'accessible') return 'bi-person-wheelchair text-primary';
    if (type === 'premium') return 'bi-star-fill text-warning';
    return 'bi-car-front-fill';
  };

  return (
    <div className="animate-fade-in pb-5">
      <div className="ps-page-header px-4 pt-4 pb-2 mb-4 border-bottom bg-white d-flex justify-content-between align-items-center">
        <div>
          <Link to="/commuter/find-parking" className="text-decoration-none text-muted small fw-bold mb-2 d-inline-block">
            <i className="bi bi-arrow-left"></i> BACK TO SEARCH
          </Link>
          <h1 className="h2 mb-1 fw-bold">{parkingLot.name}</h1>
          <p className="text-muted">
            <i className="bi bi-geo-alt-fill text-accent me-1"></i>
            {parkingLot.address.street}, {parkingLot.address.city}, {parkingLot.address.state}
          </p>
        </div>
      </div>

      <div className="container-fluid px-4">
        <div className="row g-4">
          {/* Main Info */}
          <div className="col-lg-8">
            {/* Guaranteed Spot Banner */}
            <div className="ps-card mb-4 border-0 shadow-sm" style={{ background: 'linear-gradient(to right, var(--ps-primary), var(--ps-primary-light))', color: 'white' }}>
              <div className="ps-card-body d-flex align-items-center gap-4">
                <i className="bi bi-shield-check" style={{ fontSize: '3.5rem', color: 'var(--ps-accent)' }}></i>
                <div>
                  <h3 className="fw-bold mb-1">GUARANTEED SPOT</h3>
                  <p className="mb-0 opacity-75" style={{ fontSize: '1.1rem' }}>
                    Reserve your exact parking slot in real-time. No circling, no stress. Choose your preferred level and slot below.
                  </p>
                </div>
              </div>
            </div>

            {/* Floor Visualization */}
            <h4 className="fw-bold mb-3">Live Interactive Floor Map</h4>
            
            {floors.length > 0 ? (
              <div className="ps-card border-0 shadow-sm">
                <div className="ps-card-header bg-white border-bottom-0 pt-3 pb-0">
                  {/* Floor Tabs */}
                  <ul className="nav nav-tabs border-bottom-0">
                    {floors.map(floor => (
                      <li className="nav-item" key={floor._id}>
                        <button 
                          className={`nav-link fw-bold border-0 ${selectedFloorId === floor._id ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                          style={{ backgroundColor: 'transparent', borderRadius: 0 }}
                          onClick={() => { setSelectedFloorId(floor._id); setSelectedSlot(null); }}
                        >
                          {floor.label}
                          <span className="ms-2 px-2 py-1 rounded-pill small" style={{ backgroundColor: 'var(--ps-background)' }}>
                            {floor.availableSlots} available
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="ps-card-body p-4 bg-light rounded-bottom">
                  {/* 2D Map Container */}
                  <div className="ps-parking-map">
                    <div className="ps-parking-row">
                      {activeFloor?.slots?.length > 0 ? (
                        activeFloor.slots.map(slot => (
                          <div 
                            key={slot._id} 
                            onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                            className={`ps-slot ${slot.status} ${selectedSlot?._id === slot._id ? 'border-primary border-3 shadow-lg' : ''}`}
                            style={{ 
                              transform: selectedSlot?._id === slot._id ? 'scale(1.05)' : '', 
                              opacity: slot.status !== 'available' ? 0.6 : 1 
                            }}
                          >
                            <i className={`bi fs-3 mb-2 ${slot.status === 'available' ? getSlotIcon(slot.type) : (slot.status === 'reserved' ? 'bi-lock-fill text-reserved' : 'bi-car-front-fill text-muted')}`}></i>
                            <span>{slot.slotNumber}</span>
                            {selectedSlot?._id === slot._id && (
                              <span className="badge bg-primary position-absolute" style={{ bottom: '-10px' }}>Selected</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-muted text-center w-100 py-5">
                          <i className="bi bi-cone-striped fs-1 mb-2 d-block opacity-50"></i>
                          No slots mapped for this floor yet.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="d-flex flex-wrap gap-4 mt-4 justify-content-center fw-bold small text-muted text-uppercase" style={{ letterSpacing: '0.05em' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 16, height: 16, border: '2px solid var(--ps-available)', borderRadius: 3 }}></div> Available
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 16, height: 16, border: '2px solid var(--ps-reserved)', borderRadius: 3 }}></div> Reserved
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 16, height: 16, backgroundColor: 'var(--ps-border)', border: '2px solid var(--ps-border)', borderRadius: 3 }}></div> Occupied
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 16, height: 16, border: '2px solid var(--ps-secondary)', background: 'repeating-linear-gradient(45deg, var(--ps-background), var(--ps-background) 2px, var(--ps-border) 2px, var(--ps-border) 4px)', borderRadius: 3 }}></div> Maintenance
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ps-card bg-light border-0">
                <div className="ps-card-body text-center py-5">
                  <i className="bi bi-map text-muted fs-1 mb-3 d-block"></i>
                  <h5 className="text-muted">Floor plan unavailable</h5>
                </div>
              </div>
            )}
          </div>

          {/* ── PREMIUM SERVICES SECTION ─────────────────────── */}
          {premiumServices.length > 0 && (
            <div className="col-12">
              <h4 className="fw-bold mb-3">Premium Services Available</h4>
              {serviceBookingMsg && (
                <div className={`alert ${serviceBookingMsg.startsWith('✅') ? 'alert-success' : 'alert-danger'} py-2`}>
                  {serviceBookingMsg}
                </div>
              )}
              <div className="row g-3">
                {premiumServices.map(svc => {
                  const cfg = SVC_CFG[svc.serviceType] || {};
                  return (
                    <div key={svc._id} className="col-md-6 col-lg-3">
                      <div className="ps-card h-100" style={{ borderTop: `3px solid ${cfg.color}` }}>
                        <div className="ps-card-body">
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                              <i className={`bi ${cfg.icon} fs-5`}></i>
                            </div>
                            <div>
                              <div className="fw-bold text-main" style={{ fontSize: '0.9rem' }}>{svc.name}</div>
                              <div className="text-muted small">{cfg.label}</div>
                            </div>
                          </div>
                          {svc.description && <p className="text-muted small mb-2">{svc.description}</p>}
                          <div className="fw-bold text-primary mb-1">₹{svc.price} <span className="text-muted fw-normal small">/{svc.pricingType.replace('per_', '')}</span></div>
                          <div className="text-muted small mb-3">
                            {svc.operatingHours.is24Hours ? '24 hrs' : `${svc.operatingHours.open}–${svc.operatingHours.close}`}
                          </div>
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() => { setBookingService(svc); setServiceBookingMsg(''); setServiceBooking({ startTime: bookingParams.startTime, endTime: '', packageName: '' }); }}
                          >
                            <i className="bi bi-plus me-1"></i>Add Service
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SERVICE BOOKING MODAL */}
          {bookingService && (
            <>
              <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
              <div className="modal d-block" style={{ zIndex: 1050 }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom">
                      <h5 className="modal-title fw-bold">Book — {bookingService.name}</h5>
                      <button className="btn-close" onClick={() => setBookingService(null)}></button>
                    </div>
                    <form onSubmit={handleBookService}>
                      <div className="modal-body p-4">
                        {serviceBookingMsg && (
                          <div className={`alert ${serviceBookingMsg.startsWith('✅') ? 'alert-success' : 'alert-danger'} py-2 mb-3`}>{serviceBookingMsg}</div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">Start Time</label>
                          <input type="time" className="form-control" value={serviceBooking.startTime} onChange={e => setServiceBooking(s => ({ ...s, startTime: e.target.value }))} required />
                        </div>
                        {bookingService.serviceType === 'CAR_WASH' && bookingService.carWashConfig?.packages?.length > 0 && (
                          <div className="mb-3">
                            <label className="form-label">Package</label>
                            <select className="form-select" value={serviceBooking.packageName} onChange={e => setServiceBooking(s => ({ ...s, packageName: e.target.value }))} required>
                              <option value="">Select package...</option>
                              {bookingService.carWashConfig.packages.map(p => (
                                <option key={p.name} value={p.name}>{p.name} — ₹{p.price}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="bg-light p-3 rounded">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Service</span><span className="fw-bold">{bookingService.name}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Duration</span><span>{bookingService.duration} min</span>
                          </div>
                          <div className="d-flex justify-content-between pt-2 border-top fw-bold">
                            <span>Amount</span><span className="text-primary">₹{bookingService.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer border-top bg-light">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setBookingService(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={serviceBookingLoading}>
                          {serviceBookingLoading ? 'Booking...' : 'Confirm & Pay'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* ── END PREMIUM SERVICES ─────────────────────────── */}

          {/* Sidebar Info & Booking Form */}
          <div className="col-lg-4">
            <div className="ps-card border-0 shadow-sm position-sticky" style={{ top: '80px' }}>
              <div className="ps-card-header bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">Reserve Your Spot</h5>
              </div>
              <div className="ps-card-body p-4">
                
                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted">Selected Slot</label>
                  {selectedSlot ? (
                    <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: 'rgba(14, 159, 110, 0.1)', border: '1px solid var(--ps-available)' }}>
                      <div className="d-flex align-items-center gap-3">
                        <i className={`bi ${getSlotIcon(selectedSlot.type)} fs-4`}></i>
                        <div>
                          <div className="fw-bold fs-5 text-main">{selectedSlot.slotNumber}</div>
                          <div className="small text-muted text-capitalize">{selectedSlot.type}</div>
                        </div>
                      </div>
                      <i className="bi bi-check-circle-fill text-available fs-4"></i>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center p-3 rounded bg-light border text-muted">
                      <i className="bi bi-hand-index-thumb me-2"></i> Click an available slot on the map
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted">Vehicle</label>
                  <select 
                    className="form-select" 
                    value={selectedVehicle}
                    onChange={e => setSelectedVehicle(e.target.value)}
                  >
                    <option value="" disabled>Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.brand} {v.model})</option>
                    ))}
                  </select>
                  {vehicles.length === 0 && (
                    <div className="form-text text-warning"><i className="bi bi-exclamation-triangle"></i> You need to add a vehicle first.</div>
                  )}
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-uppercase text-muted">Date</label>
                    <input type="date" className="form-control" value={bookingParams.date} onChange={e => setBookingParams({...bookingParams, date: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-uppercase text-muted">Start Time</label>
                    <input type="time" className="form-control" value={bookingParams.startTime} onChange={e => setBookingParams({...bookingParams, startTime: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-uppercase text-muted">Duration (Hours)</label>
                    <select className="form-select" value={bookingParams.duration} onChange={e => setBookingParams({...bookingParams, duration: Number(e.target.value)})}>
                      {[1,2,3,4,8,12,24].map(h => <option key={h} value={h}>{h} Hours</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-light p-3 rounded mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Rate</span>
                    <span>₹{pricePerHour.toFixed(2)} / hr</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Duration</span>
                    <span>{bookingParams.duration} hr</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top fw-bold fs-5 text-main">
                    <span>Total</span>
                    <span>₹{(pricePerHour * bookingParams.duration).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary btn-lg" 
                    onClick={handleBookNow}
                    disabled={!selectedSlot || !selectedVehicle}
                  >
                    Proceed to Checkout
                  </button>
                  <div className="text-center my-2 text-muted small fw-bold">OR</div>
                  <button 
                    className="btn btn-outline-warning" 
                    onClick={handleJoinWaitlist}
                    disabled={waitlisting || !selectedVehicle}
                  >
                    {waitlisting ? 'Joining...' : 'Lot Full? Join Waitlist'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
