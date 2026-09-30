import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import premiumServiceApi from '../../services/premiumService.service';

const SERVICE_TYPE_CONFIG = {
  EV_CHARGING: { icon: 'bi-lightning-charge-fill', color: '#10b981', label: 'EV Charging', bg: '#d1fae5' },
  VALET: { icon: 'bi-key-fill', color: '#6366f1', label: 'Valet', bg: '#ede9fe' },
  CAR_WASH: { icon: 'bi-droplet-fill', color: '#3b82f6', label: 'Car Wash', bg: '#dbeafe' },
  PREMIUM_SLOT: { icon: 'bi-star-fill', color: '#f59e0b', label: 'Premium Slot', bg: '#fef9c3' },
};

const STATUS_COLOR = {
  confirmed: 'success',
  completed: 'secondary',
  cancelled: 'danger',
  in_progress: 'primary',
  vehicle_received: 'info',
  parked: 'primary',
  ready_for_pickup: 'warning',
};

export default function CommuterPremiumServicesPage() {
  const [bookings, setBookings] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const [res, allRes] = await Promise.all([
        premiumServiceApi.getMyBookings(),
        premiumServiceApi.getAllActiveServices()
      ]);
      setBookings(res.data?.data?.bookings || []);
      setAvailableServices(allRes.data?.data?.services || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this service booking?')) return;
    setCancelling(id);
    try {
      await premiumServiceApi.cancelBooking(id, 'User requested cancellation');
      await fetchBookings();
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header">
        <h1>My Premium Services</h1>
        <p>Your EV charging, valet, car wash, and premium slot bookings.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="ps-card">
          <div className="ps-card-body text-center py-5">
            <i className="bi bi-stars fs-1 text-muted d-block mb-3"></i>
            <h5>No service bookings yet</h5>
            <p className="text-muted">Browse parking lots to discover and book premium services.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map(b => {
            const cfg = SERVICE_TYPE_CONFIG[b.serviceType] || {};
            const canCancel = !['completed', 'cancelled'].includes(b.status);
            return (
              <div key={b._id} className="col-md-6 col-lg-4">
                <div className="ps-card h-100">
                  <div className="ps-card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                        <i className={`bi ${cfg.icon}`}></i>
                      </div>
                      <div>
                        <div className="fw-bold text-main" style={{ fontSize: '0.9rem' }}>{b.premiumService?.name || cfg.label}</div>
                        <div className="text-muted small">{b.parkingLot?.name}</div>
                      </div>
                    </div>
                    <span className={`badge bg-${STATUS_COLOR[b.status] || 'secondary'}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="ps-card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Date</span>
                      <span className="small fw-bold">{new Date(b.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Time</span>
                      <span className="small fw-bold">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Amount</span>
                      <span className="fw-bold text-primary">₹{b.amount}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Payment</span>
                      <span className={`badge bg-${b.paymentStatus === 'paid' ? 'success' : b.paymentStatus === 'refunded' ? 'info' : 'warning'}`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                    {b.passCode && (
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">Pass</span>
                        <code className="small">{b.passCode}</code>
                      </div>
                    )}
                    {b.selectedPackage?.name && (
                      <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                        <span className="text-muted small">Package</span>
                        <span className="small fw-bold">{b.selectedPackage.name}</span>
                      </div>
                    )}
                    {/* Valet status tracker */}
                    {b.serviceType === 'VALET' && !['cancelled', 'completed'].includes(b.status) && (
                      <div className="mt-3 pt-2 border-top">
                        <div className="text-muted small mb-2 fw-bold">Valet Status</div>
                        {['confirmed', 'vehicle_received', 'parked', 'ready_for_pickup', 'completed'].map((step, i) => (
                          <div key={step} className="d-flex align-items-center gap-2 mb-1">
                            <i className={`bi ${b.status === step ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`} style={{ fontSize: '0.875rem' }}></i>
                            <span className={`small ${b.status === step ? 'fw-bold text-main' : 'text-muted'}`}>
                              {step.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {canCancel && (
                    <div className="ps-card-footer">
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => handleCancel(b._id)}
                        disabled={cancelling === b._id}
                      >
                        {cancelling === b._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Discover Services Section */}
      <div className="mt-5 pt-4 border-top">
        <h3 className="fw-bold mb-4">Discover Premium Services</h3>
        {availableServices.length === 0 ? (
          <p className="text-muted">No active premium services are available right now.</p>
        ) : (
          <div className="row g-3">
            {availableServices.map(svc => {
              const cfg = SERVICE_TYPE_CONFIG[svc.serviceType] || {};
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
                      <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                        <i className="bi bi-geo-alt-fill text-danger"></i> {svc.parkingLot?.name}
                      </div>
                      {svc.description && <p className="text-muted small mb-2 text-truncate">{svc.description}</p>}
                      <div className="fw-bold text-primary mb-1">₹{svc.price} <span className="text-muted fw-normal small">/{svc.pricingType.replace('per_', '')}</span></div>
                    </div>
                    <div className="ps-card-footer bg-transparent border-top">
                      <Link to={`/commuter/parking/${svc.parkingLot?._id}`} className="btn btn-outline-primary btn-sm w-100">
                        View & Book
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
