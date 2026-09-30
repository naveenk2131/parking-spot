import React from 'react';
import EmptyState from '../components/EmptyState';
import ProfilePage from './commuter/ProfilePage';
// Re-exported for use in owner/admin layouts


const createPlaceholder = (title, desc, icon) => {
  const PlaceholderPage = () => (
    <div className="animate-fade-in">
      <div className="ps-page-header"><h1>{title}</h1><p>{desc}</p></div>
      <div className="ps-card"><div className="ps-card-body">
        <EmptyState icon={icon} title={`${title} — Coming in Phase 2`} description="This section will be fully implemented in the next phase." />
      </div></div>
    </div>
  );
  PlaceholderPage.displayName = `${title}Page`;
  return PlaceholderPage;
};

export const OwnerSlotsPage = createPlaceholder('Slots', 'Manage individual parking slots.', '🅿️');
export const OwnerBookingsPage = createPlaceholder('Bookings', 'View reservations for your lots.', '📋');
export const OwnerOccupancyPage = createPlaceholder('Occupancy', 'Real-time slot occupancy data.', '📊');
export const OwnerRevenuePage = createPlaceholder('Revenue', 'Track earnings and payouts.', '💰');
export const OwnerProfilePage = ProfilePage;

export const AdminOwnersPage = createPlaceholder('Owners', 'Manage parking facility owners.', '🏢');
export const AdminParkingPage = createPlaceholder('Parking', 'Manage all parking lots.', '🅿️');
export const AdminBookingsPage = createPlaceholder('Bookings', 'View all platform reservations.', '📋');
export const AdminPaymentsPage = createPlaceholder('Payments', 'Track all transactions.', '💳');
export const AdminRevenuePage = createPlaceholder('Revenue', 'Platform revenue and analytics.', '💰');
export const AdminSettingsPage = createPlaceholder('Settings', 'Platform configuration and settings.', '⚙️');
export const AdminProfilePage = ProfilePage;
