import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

// State
import { AuthProvider } from './state/AuthContext';
import { useAuth } from './state/AuthContext';

// Route Guard
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import CommuterLayout from './layouts/CommuterLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';
import SpotAssist from './components/SpotAssist';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { NotFoundPage, UnauthorizedPage } from './pages/ErrorPages';

// Commuter Pages
import CommuterDashboard from './pages/commuter/CommuterDashboard';
import FindParkingPage from './pages/commuter/FindParkingPage';
import ParkingDetailsPage from './pages/commuter/ParkingDetailsPage';
import CheckoutPage from './pages/commuter/CheckoutPage';
import BookingSuccessPage from './pages/commuter/BookingSuccessPage';
import MyBookingsPage from './pages/commuter/MyBookingsPage';
import VehiclesPage from './pages/commuter/VehiclesPage';
import FavoritesPage from './pages/commuter/FavoritesPage';
import ProfilePage from './pages/commuter/ProfilePage';
import CommuterPremiumServicesPage from './pages/commuter/CommuterPremiumServicesPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ParkingLotsPage from './pages/owner/ParkingLotsPage';
import ManageParkingLotPage from './pages/owner/ManageParkingLotPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerOccupancyPage from './pages/owner/OwnerOccupancyPage';
import OwnerRevenuePage from './pages/owner/OwnerRevenuePage';
import OwnerPremiumServicesPage from './pages/owner/OwnerPremiumServicesPage';
import NotificationsPage from './pages/commuter/NotificationsPage';
import {
  OwnerSlotsPage,
} from './pages/PlaceholderPages';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import {
  AdminOwnersPage,
  AdminParkingPage,
  AdminBookingsPage,
  AdminPaymentsPage,
  AdminRevenuePage,
  AdminSettingsPage,
} from './pages/PlaceholderPages';

// Smart redirect based on role
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/commuter" replace />;
};

// Redirect auth pages if already logged in
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <RoleRedirect />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Auto redirect based on role */}
      <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* Commuter */}
      <Route
        path="/commuter"
        element={<ProtectedRoute roles={['commuter']}><CommuterLayout /></ProtectedRoute>}
      >
        <Route index element={<CommuterDashboard />} />
        <Route path="find-parking" element={<FindParkingPage />} />
        <Route path="parking/:id" element={<ParkingDetailsPage />} />
        <Route path="checkout/:id" element={<CheckoutPage />} />
        <Route path="booking-success/:id" element={<BookingSuccessPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="premium-services" element={<CommuterPremiumServicesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Owner */}
      <Route
        path="/owner"
        element={<ProtectedRoute roles={['owner']}><OwnerLayout /></ProtectedRoute>}
      >
        <Route index element={<OwnerDashboard />} />
        <Route path="parking-lots" element={<ParkingLotsPage />} />
        <Route path="parking-lots/:id" element={<ManageParkingLotPage />} />
        <Route path="slots" element={<OwnerSlotsPage />} />
        <Route path="bookings" element={<OwnerBookingsPage />} />
        <Route path="premium-services" element={<OwnerPremiumServicesPage />} />
        <Route path="occupancy" element={<OwnerOccupancyPage />} />
        <Route path="revenue" element={<OwnerRevenuePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="owners" element={<AdminOwnersPage />} />
        <Route path="parking" element={<AdminParkingPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="revenue" element={<AdminRevenuePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <SpotAssist />
      </AuthProvider>
    </Router>
  );
}

export default App;
