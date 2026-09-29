import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const adminNav = [
  {
    items: [
      { path: '/admin', label: 'Overview', icon: '🏠', exact: true },
      { path: '/admin/users', label: 'Users', icon: '👥' },
      { path: '/admin/owners', label: 'Owners', icon: '🏢' },
      { path: '/admin/parking', label: 'Parking', icon: '🅿️' },
      { path: '/admin/bookings', label: 'Bookings', icon: '📋' },
      { path: '/admin/payments', label: 'Payments', icon: '💳' },
      { path: '/admin/revenue', label: 'Revenue', icon: '💰' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
      { path: '/admin/profile', label: 'Profile', icon: '👤' },
    ],
  },
];

const AdminLayout = () => {
  return (
    <>
      <AppNavbar />
      <div className="ps-dashboard-layout">
        <Sidebar navItems={adminNav} />
        <main className="ps-main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
