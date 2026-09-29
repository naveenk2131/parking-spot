/**
 * Format API error messages into a user-friendly string
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // Axios error with response
  if (error.response) {
    const data = error.response.data;
    if (data?.message) return data.message;
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map(e => e.message).join(', ');
    }
    return `Server error: ${error.response.status}`;
  }

  // Network error
  if (error.request) {
    return 'Unable to connect to the server. Please check your connection.';
  }

  return error.message || 'An unexpected error occurred.';
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

/**
 * Format a date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get role display info
 */
export const getRoleInfo = (role) => {
  const roles = {
    commuter: { label: 'Commuter', icon: '🚗', badgeClass: 'badge-role-commuter' },
    owner: { label: 'Owner', icon: '🏢', badgeClass: 'badge-role-owner' },
    admin: { label: 'Admin', icon: '⚙️', badgeClass: 'badge-role-admin' },
  };
  return roles[role] || { label: capitalize(role), icon: '👤', badgeClass: '' };
};

/**
 * Truncate text
 */
export const truncate = (str, maxLen = 100) => {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
};
