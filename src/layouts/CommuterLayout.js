import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const commuterNav = [
  {
    label: 'Navigation',
    items: [
      { path: '/commuter', label: 'Dashboard', icon: 'bi-grid-1x2', exact: true },
      { path: '/commuter/find-parking', label: 'Find Parking', icon: 'bi-search' },
      { path: '/commuter/bookings', label: 'My Bookings', icon: 'bi-calendar-check' },
      { path: '/commuter/premium-services', label: 'Premium Services', icon: 'bi-star' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { path: '/commuter/vehicles', label: 'Vehicles', icon: 'bi-car-front' },
      { path: '/commuter/favorites', label: 'Favorites', icon: 'bi-star' },
      { path: '/commuter/notifications', label: 'Notifications', icon: 'bi-bell' },
      { path: '/commuter/profile', label: 'Profile', icon: 'bi-person' },
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
