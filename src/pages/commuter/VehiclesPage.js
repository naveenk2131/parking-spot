import React from 'react';
import EmptyState from '../../components/EmptyState';

const VehiclesPage = () => (
  <div className="animate-fade-in">
    <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
      <div><h1>My Vehicles</h1><p>Manage your registered vehicles for quick booking.</p></div>
      <button className="btn btn-primary btn-sm" id="add-vehicle-btn">+ Add Vehicle</button>
    </div>
    <div className="ps-card"><div className="ps-card-body">
      <EmptyState icon="🚗" title="No vehicles registered" description="Add your vehicle to speed up the booking process." action={<button className="btn btn-primary btn-sm" id="add-vehicle-empty-btn">Add Your First Vehicle</button>} />
    </div></div>
  </div>
);

export default VehiclesPage;
