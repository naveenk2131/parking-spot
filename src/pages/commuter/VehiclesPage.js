import React, { useState, useEffect } from 'react';
import EmptyState from '../../components/EmptyState';
import vehicleService from '../../services/vehicle.service';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  const [formData, setFormData] = useState({
    licensePlate: '',
    type: 'car',
    make: '',
    model: '',
    color: '',
    year: new Date().getFullYear(),
    isDefault: false
  });
  
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const res = await vehicleService.getMyVehicles();
      setVehicles(res.data?.data?.vehicles || res.data?.vehicles || []);
    } catch (err) {
      console.error('Error fetching vehicles', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        licensePlate: vehicle.licensePlate,
        type: vehicle.type,
        make: vehicle.make || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        year: vehicle.year || new Date().getFullYear(),
        isDefault: vehicle.isDefault
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        licensePlate: '',
        type: 'car',
        make: '',
        model: '',
        color: '',
        year: new Date().getFullYear(),
        isDefault: vehicles.length === 0
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle._id, formData);
      } else {
        await vehicleService.addVehicle(formData);
      }
      await fetchVehicles();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(id);
        await fetchVehicles();
      } catch (err) {
        console.error('Error deleting vehicle', err);
      }
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'car': return 'bi-car-front-fill';
      case 'motorcycle': return 'bi-bicycle'; // close enough for bootstrap icons
      case 'van':
      case 'truck': return 'bi-truck';
      default: return 'bi-car-front-fill';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <h1>My Vehicles</h1>
          <p>Manage your registered vehicles for quick booking.</p>
        </div>
        <button className="btn btn-primary btn-sm" id="add-vehicle-btn" onClick={() => openModal()}>
          <i className="bi bi-plus"></i> Add Vehicle
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="ps-card">
          <div className="ps-card-body">
            <EmptyState 
              icon="bi-car-front" 
              title="No vehicles registered" 
              description="Add your vehicle to speed up the booking process." 
              action={
                <button className="btn btn-primary btn-sm" id="add-vehicle-empty-btn" onClick={() => openModal()}>
                  Add Your First Vehicle
                </button>
              } 
            />
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {vehicles.map(v => (
            <div className="col-md-6 col-lg-4" key={v._id}>
              <div className={`ps-card h-100 ${v.isDefault ? 'border-primary' : ''}`}>
                <div className="ps-card-header bg-transparent d-flex justify-content-between align-items-center">
                  <span className="fw-bold fs-5 text-main">
                    {v.licensePlate}
                  </span>
                  {v.isDefault && <span className="ps-badge ps-badge-available">Default</span>}
                </div>
                <div className="ps-card-body">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: 'var(--ps-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`bi ${getVehicleIcon(v.type)} fs-3 text-muted`}></i>
                    </div>
                    <div>
                      <div className="fw-bold">{v.make || 'Unknown Make'} {v.model || ''}</div>
                      <div className="text-muted small text-capitalize">{v.type} • {v.year}</div>
                    </div>
                  </div>
                  {v.color && (
                    <div className="text-muted small mb-3">Color: <span className="fw-bold text-main">{v.color}</span></div>
                  )}
                </div>
                <div className="ps-card-footer bg-transparent border-top d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => openModal(v)}>
                    Edit
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(v._id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay directly implemented */}
      {isModalOpen && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      )}
      
      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content ps-card border-0 shadow-lg" onSubmit={handleSubmit}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4">
                {error && (
                  <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.875rem' }}>
                    {error}
                  </div>
                )}
                  <div className="mb-3">
                    <label className="form-label">License Plate / Vehicle Number *</label>
                    <input 
                      type="text" 
                      className="form-control text-uppercase" 
                      name="licensePlate" 
                      value={formData.licensePlate} 
                      onChange={handleChange} 
                      required 
                      disabled={!!editingVehicle}
                      placeholder="e.g. ABC 1234"
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Type *</label>
                      <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
                        <option value="car">Car</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="van">Van</option>
                        <option value="truck">Truck</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Year *</label>
                      <input type="number" className="form-control" name="year" value={formData.year} onChange={handleChange} required min="1990" max={new Date().getFullYear() + 1} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Make / Brand *</label>
                      <input type="text" className="form-control" name="make" value={formData.make} onChange={handleChange} required placeholder="e.g. Toyota" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Model</label>
                      <input type="text" className="form-control" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Camry" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input type="text" className="form-control" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Silver" />
                  </div>
                  <div className="mb-4 form-check">
                    <input type="checkbox" className="form-check-input" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                    <label className="form-check-label fw-bold" htmlFor="isDefault">Set as default vehicle</label>
                  </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
