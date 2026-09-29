import api from './api';

const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Admin only
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/users/${userId}/status`, { isActive });
    return response.data;
  },
};

export default userService;
