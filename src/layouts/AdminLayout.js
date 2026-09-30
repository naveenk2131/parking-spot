import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const adminNav = [
  {
    label: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'bi-grid-1x2', exact: true },
      { path: '/admin/users', label: 'Users', icon: 'bi-people' },
      { path: '/admin/owners', label: 'Owners', icon: 'bi-building' },
      { path: '/admin/parking', label: 'Parking', icon: 'bi-p-circle' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/admin/bookings', label: 'Bookings', icon: 'bi-calendar-check' },
      { path: '/admin/payments', label: 'Payments', icon: 'bi-credit-card' },
      { path: '/admin/revenue', label: 'Revenue', icon: 'bi-graph-up' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: 'bi-gear' },
      { path: '/admin/profile', label: 'Profile', icon: 'bi-person' },
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
