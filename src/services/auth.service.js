import api from './api';

const authService = {
  /**
   * Register a new user
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Get current user
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Ignore errors — we still clear local storage
    }
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
  },

  /**
   * Save auth data to local storage
   */
  saveAuth: (token, user) => {
    localStorage.setItem('ps_token', token);
    localStorage.setItem('ps_user', JSON.stringify(user));
  },

  /**
   * Get saved token
   */
  getToken: () => localStorage.getItem('ps_token'),

  /**
   * Get saved user
   */
  getSavedUser: () => {
    try {
      const raw = localStorage.getItem('ps_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if authenticated
   */
  isAuthenticated: () => !!localStorage.getItem('ps_token'),
};

export default authService;
