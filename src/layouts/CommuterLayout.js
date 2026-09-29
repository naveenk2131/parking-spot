import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const commuterNav = [
  {
    items: [
      { path: '/commuter', label: 'Overview', icon: '🏠', exact: true },
      { path: '/commuter/find-parking', label: 'Find Parking', icon: '🔍' },
      { path: '/commuter/bookings', label: 'My Bookings', icon: '📋' },
      { path: '/commuter/vehicles', label: 'Vehicles', icon: '🚗' },
      { path: '/commuter/favorites', label: 'Favorites', icon: '⭐' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/commuter/profile', label: 'Profile', icon: '👤' },
    ],
  },
];

const CommuterLayout = () => {
  return (
    <>
      <AppNavbar />
      <div className="ps-dashboard-layout">
        <Sidebar navItems={commuterNav} />
        <main className="ps-main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default CommuterLayout;
