import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ownerNav = [
  {
    label: 'Overview',
    items: [
      { path: '/owner', label: 'Dashboard', icon: 'bi-grid-1x2', exact: true },
      { path: '/owner/parking-lots', label: 'Parking Lots', icon: 'bi-building' },
      { path: '/owner/slots', label: 'Slots', icon: 'bi-p-circle' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/owner/bookings', label: 'Bookings', icon: 'bi-calendar-check' },
      { path: '/owner/premium-services', label: 'Premium Services', icon: 'bi-star' },
      { path: '/owner/occupancy', label: 'Occupancy', icon: 'bi-bar-chart' },
      { path: '/owner/revenue', label: 'Revenue', icon: 'bi-graph-up' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/owner/profile', label: 'Profile', icon: 'bi-person' },
    ],
  },
];

const OwnerLayout = () => {
  return (
    <>
      <AppNavbar />
      <div className="ps-dashboard-layout">
        <Sidebar navItems={ownerNav} />
        <main className="ps-main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default OwnerLayout;
