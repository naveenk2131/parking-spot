import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ownerNav = [
  {
    items: [
      { path: '/owner', label: 'Overview', icon: '🏠', exact: true },
      { path: '/owner/parking-lots', label: 'Parking Lots', icon: '🏢' },
      { path: '/owner/slots', label: 'Slots', icon: '🅿️' },
      { path: '/owner/bookings', label: 'Bookings', icon: '📋' },
      { path: '/owner/occupancy', label: 'Occupancy', icon: '📊' },
      { path: '/owner/revenue', label: 'Revenue', icon: '💰' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/owner/profile', label: 'Profile', icon: '👤' },
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
