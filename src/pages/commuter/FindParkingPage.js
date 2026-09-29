import React from 'react';
import EmptyState from '../../components/EmptyState';

const FindParkingPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="ps-page-header">
        <h1>Find Parking</h1>
        <p>Search and reserve available parking spots near your destination.</p>
      </div>

      {/* Search Bar (Phase 2 implementation) */}
      <div className="ps-card mb-4">
        <div className="ps-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Location</label>
              <div className="input-group">
                <span className="input-group-text">📍</span>
                <input type="text" className="form-control" placeholder="Enter address, landmark or area" />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-2">
              <label className="form-label">From</label>
              <input type="time" className="form-control" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Until</label>
              <input type="time" className="form-control" />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" id="find-parking-search-btn">
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results (Coming Phase 2) */}
      <div className="ps-card">
        <div className="ps-card-body">
          <EmptyState
            icon="🔍"
            title="Search for parking spots"
            description="Enter your destination and dates above to find available parking near you."
          />
        </div>
      </div>
    </div>
  );
};

export default FindParkingPage;
