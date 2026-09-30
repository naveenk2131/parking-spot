import React, { useState, useEffect, useCallback } from 'react';
import premiumServiceApi from '../../services/premiumService.service';

const SERVICE_TYPE_CONFIG = {
  EV_CHARGING: { icon: 'bi-lightning-charge-fill', color: '#10b981', label: 'EV Charging' },
  VALET: { icon: 'bi-key-fill', color: '#6366f1', label: 'Valet' },
  CAR_WASH: { icon: 'bi-droplet-fill', color: '#3b82f6', label: 'Car Wash' },
  PREMIUM_SLOT: { icon: 'bi-star-fill', color: '#f59e0b', label: 'Premium Slot' },
};

const STATUS_BADGE = {
  ACTIVE: 'ps-badge-available',
  INACTIVE: 'ps-badge-neutral',
  MAINTENANCE: 'ps-badge-reserved',
};

const defaultForm = {
  serviceType: 'EV_CHARGING',
  name: '',
  description: '',
  price: '',
  pricingType: 'per_hour',
  capacity: 1,
  duration: 60,
  status: 'ACTIVE',
  operatingHours: { open: '06:00', close: '22:00', is24Hours: false },
  requirements: '',
  terms: '',
  parkingLotId: '',
};

export default function OwnerPremiumServicesPage() {
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lots, setLots] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, analyticsRes, bookingsRes] = await Promise.all([
        premiumServiceApi.getOwnerServices(),
        premiumServiceApi.getAnalytics(),
        premiumServiceApi.getOwnerBookings(),
      ]);
      setServices(svcRes.data?.data?.services || []);
      setAnalytics(analyticsRes.data?.data || null);
      setBookings(bookingsRes.data?.data?.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch owner's lots for the create form
  useEffect(() => {
    fetchAll();
    // Get owner lots from the parking API
    import('../../services/api').then(({ default: api }) => {
      api.get('/parking/my-lots')
        .then(r => setLots(r.data?.data?.parkingLots || []))
        .catch(err => console.error('Failed to fetch lots:', err));
    });
  }, [fetchAll]);

  const openCreate = () => {
    setEditingService(null);
    setForm({ ...defaultForm, parkingLotId: lots[0]?._id || '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditingService(svc);
    setForm({
      serviceType: svc.serviceType,
      name: svc.name,
      description: svc.description || '',
      price: svc.price,
      pricingType: svc.pricingType,
      capacity: svc.capacity,
      duration: svc.duration,
      status: svc.status,
      operatingHours: svc.operatingHours,
      requirements: svc.requirements || '',
      terms: svc.terms || '',
      parkingLotId: svc.parkingLot?._id || svc.parkingLot || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity),
        duration: parseInt(form.duration),
      };
      if (editingService) {
        await premiumServiceApi.updateService(editingService._id, payload);
      } else {
        await premiumServiceApi.createService(form.parkingLotId, payload);
      }
      await fetchAll();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (svc) => {
    const newStatus = svc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await premiumServiceApi.updateService(svc._id, { status: newStatus });
      await fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await premiumServiceApi.deleteService(id);
      await fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await premiumServiceApi.updateBookingStatus(id, status);
      await fetchAll();
    } catch (e) { console.error(e); }
  };

  const formatCur = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <h1>Premium Services</h1>
          <p>Manage EV charging, valet, car wash, and premium parking for your lots.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i> Add Service
        </button>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="ps-stat-card">
              <div className="stat-icon mb-3" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div className="stat-value">{formatCur(analytics.totalRevenue)}</div>
              <div className="stat-label text-muted">Total Service Revenue</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="ps-stat-card">
              <div className="stat-icon mb-3" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="stat-value">{bookings.filter(b => b.status !== 'cancelled').length}</div>
              <div className="stat-label text-muted">Active Bookings</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="ps-stat-card">
              <div className="stat-icon mb-3" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="stat-value">{services.filter(s => s.status === 'ACTIVE').length}</div>
              <div className="stat-label text-muted">Active Services</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="ps-stat-card">
              <div className="stat-icon mb-3" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <i className="bi bi-bar-chart-fill"></i>
              </div>
              <div className="stat-value">{services.length}</div>
              <div className="stat-label text-muted">Total Services</div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      {analytics?.revenueData?.length > 0 && (
        <div className="ps-card mb-4">
          <div className="ps-card-header fw-bold">Revenue by Service Type</div>
          <div className="ps-card-body">
            <div className="row g-3">
              {analytics.revenueData.map(r => {
                const cfg = SERVICE_TYPE_CONFIG[r._id] || {};
                return (
                  <div key={r._id} className="col-6 col-md-3">
                    <div style={{ padding: '1rem', borderRadius: 8, background: 'var(--ps-background)', textAlign: 'center' }}>
                      <i className={`bi ${cfg.icon || 'bi-star'}`} style={{ fontSize: '1.5rem', color: cfg.color || '#666' }}></i>
                      <div className="fw-bold mt-2">{cfg.label || r._id}</div>
                      <div className="fs-5 fw-bold text-primary mt-1">{formatCur(r.totalRevenue)}</div>
                      <div className="text-muted small">{r.bookings} bookings</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4 border-0" style={{ gap: '0.5rem' }}>
        {[['services', 'bi-grid', 'My Services'], ['bookings', 'bi-calendar3', 'Bookings']].map(([tab, icon, label]) => (
          <li key={tab} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab ? 'active fw-bold' : ''}`}
              style={{ border: 'none', borderBottom: activeTab === tab ? '2px solid var(--ps-accent)' : '2px solid transparent', background: 'none', borderRadius: 0 }}
              onClick={() => setActiveTab(tab)}
            >
              <i className={`bi ${icon} me-2`}></i>{label}
            </button>
          </li>
        ))}
      </ul>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {services.length === 0 ? (
            <div className="ps-card">
              <div className="ps-card-body text-center py-5">
                <i className="bi bi-stars fs-1 text-muted d-block mb-3"></i>
                <h5>No services configured yet</h5>
                <p className="text-muted">Add EV charging, valet, car wash, or premium slots to your parking lots.</p>
                <button className="btn btn-primary btn-sm" onClick={openCreate}>Add First Service</button>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {services.map(svc => {
                const cfg = SERVICE_TYPE_CONFIG[svc.serviceType] || {};
                return (
                  <div key={svc._id} className="col-md-6 col-lg-4">
                    <div className="ps-card h-100">
                      <div className="ps-card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: cfg.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                            <i className={`bi ${cfg.icon}`}></i>
                          </div>
                          <div>
                            <div className="fw-bold text-main" style={{ fontSize: '0.9rem' }}>{svc.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{cfg.label}</div>
                          </div>
                        </div>
                        <span className={`ps-badge ${STATUS_BADGE[svc.status] || 'ps-badge-neutral'}`}>{svc.status}</span>
                      </div>
                      <div className="ps-card-body">
                        {svc.description && <p className="text-muted small mb-3">{svc.description}</p>}
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Price</span>
                          <span className="fw-bold">₹{svc.price} <span className="text-muted fw-normal">/{svc.pricingType.replace('per_', '')}</span></span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Capacity</span>
                          <span className="fw-bold">{svc.capacity} units</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Hours</span>
                          <span className="fw-bold small">
                            {svc.operatingHours.is24Hours ? '24 Hours' : `${svc.operatingHours.open}–${svc.operatingHours.close}`}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted small">Lot</span>
                          <span className="fw-bold small text-truncate" style={{ maxWidth: 140 }}>{svc.parkingLot?.name || '—'}</span>
                        </div>
                      </div>
                      <div className="ps-card-footer d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => openEdit(svc)}>
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button
                          className={`btn btn-sm ${svc.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(svc)}
                        >
                          {svc.status === 'ACTIVE' ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill"></i>}
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeactivate(svc._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="ps-card">
          <div className="ps-card-body p-0">
            {bookings.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
                <p className="text-muted">No service bookings yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Service</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Time</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => {
                      const cfg = SERVICE_TYPE_CONFIG[b.serviceType] || {};
                      return (
                        <tr key={b._id}>
                          <td className="fw-bold small">{b.premiumService?.name || '—'}</td>
                          <td className="small">{b.commuter?.firstName} {b.commuter?.lastName}</td>
                          <td>
                            <span className="ps-badge ps-badge-neutral">
                              <i className={`bi ${cfg.icon} me-1`}></i>{cfg.label || b.serviceType}
                            </span>
                          </td>
                          <td className="small text-muted">{new Date(b.startTime).toLocaleString()}</td>
                          <td className="fw-bold">₹{b.amount}</td>
                          <td>
                            <span className={`badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'secondary'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.serviceType === 'VALET' && b.status === 'confirmed' && (
                              <select
                                className="form-select form-select-sm"
                                value={b.status}
                                onChange={e => handleUpdateBookingStatus(b._id, e.target.value)}
                                style={{ minWidth: 140 }}
                              >
                                {['confirmed', 'vehicle_received', 'parked', 'ready_for_pickup', 'completed'].map(s => (
                                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                              </select>
                            )}
                            {b.serviceType !== 'VALET' && b.status === 'confirmed' && (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                              >
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">
                    {editingService ? 'Edit Service' : 'Add Premium Service'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 px-3 mb-3">{error}</div>}
                  <form onSubmit={handleSubmit} id="ps-form">
                    <div className="row g-3">
                      {/* Service Type */}
                      {!editingService && (
                        <div className="col-12">
                          <label className="form-label">Service Type *</label>
                          <div className="row g-2">
                            {Object.entries(SERVICE_TYPE_CONFIG).map(([type, cfg]) => (
                              <div key={type} className="col-6 col-md-3">
                                <div
                                  onClick={() => setForm(f => ({ ...f, serviceType: type }))}
                                  style={{
                                    padding: '0.75rem',
                                    border: `2px solid ${form.serviceType === type ? cfg.color : 'var(--ps-border)'}`,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: form.serviceType === type ? cfg.color + '10' : 'transparent',
                                  }}
                                >
                                  <i className={`bi ${cfg.icon} d-block mb-1`} style={{ color: cfg.color, fontSize: '1.25rem' }}></i>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{cfg.label}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lot selector */}
                      {!editingService && (
                        <div className="col-12">
                          <label className="form-label">Parking Lot *</label>
                          <select
                            className="form-select"
                            value={form.parkingLotId}
                            onChange={e => setForm(f => ({ ...f, parkingLotId: e.target.value }))}
                            required
                          >
                            <option value="">Select a lot...</option>
                            {lots.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                          </select>
                          {lots.length === 0 && <div className="text-muted small mt-1">Create a parking lot first in "My Parking Lots".</div>}
                        </div>
                      )}

                      <div className="col-12">
                        <label className="form-label">Service Name *</label>
                        <input
                          className="form-control"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          required
                          placeholder="e.g. Fast EV Charging Bay 1"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Brief description of this service..."
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label">Price (₹) *</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label">Pricing Type *</label>
                        <select
                          className="form-select"
                          value={form.pricingType}
                          onChange={e => setForm(f => ({ ...f, pricingType: e.target.value }))}
                        >
                          <option value="fixed">Fixed</option>
                          <option value="per_hour">Per Hour</option>
                          <option value="per_kwh">Per kWh</option>
                          <option value="per_session">Per Session</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label">Capacity *</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={form.capacity}
                          onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label">Duration (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="15"
                          value={form.duration}
                          onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </div>

                      <div className="col-12 border-top pt-3 mt-1">
                        <label className="form-label">Operating Hours</label>
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="is24h"
                            checked={form.operatingHours.is24Hours}
                            onChange={e => setForm(f => ({ ...f, operatingHours: { ...f.operatingHours, is24Hours: e.target.checked } }))}
                          />
                          <label className="form-check-label" htmlFor="is24h">24 Hours</label>
                        </div>
                        {!form.operatingHours.is24Hours && (
                          <div className="row g-2">
                            <div className="col-6">
                              <input
                                type="time"
                                className="form-control"
                                value={form.operatingHours.open}
                                onChange={e => setForm(f => ({ ...f, operatingHours: { ...f.operatingHours, open: e.target.value } }))}
                              />
                            </div>
                            <div className="col-6">
                              <input
                                type="time"
                                className="form-control"
                                value={form.operatingHours.close}
                                onChange={e => setForm(f => ({ ...f, operatingHours: { ...f.operatingHours, close: e.target.value } }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label">Requirements</label>
                        <input
                          className="form-control"
                          value={form.requirements}
                          onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                          placeholder="e.g. EV-only, must pre-book 1 hour in advance"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" form="ps-form" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
