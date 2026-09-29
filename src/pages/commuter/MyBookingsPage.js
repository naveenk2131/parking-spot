import React from 'react';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';

const MyBookingsPage = () => (
  <div className="animate-fade-in">
    <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
      <div><h1>My Bookings</h1><p>View and manage all your parking reservations.</p></div>
      <Link to="/commuter/find-parking" className="btn btn-primary btn-sm">+ New Booking</Link>
    </div>
    <div className="mb-3 d-flex gap-2 flex-wrap">
      {['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'].map(tab => (
        <button key={tab} className={`btn btn-sm ${tab === 'All' ? 'btn-primary' : 'btn-ghost'}`}>{tab}</button>
      ))}
    </div>
    <div className="ps-card"><div className="ps-card-body">
      <EmptyState icon="📋" title="No bookings yet" description="Your reservations will appear here once you book a parking spot." action={<Link to="/commuter/find-parking" className="btn btn-primary btn-sm">Find Parking</Link>} />
    </div></div>
  </div>
);

export default MyBookingsPage;
