import api from './api';

/**
 * Dashboard API Service
 * Handles composite dashboard endpoints
 */

export const dashboardService = {
  /**
   * Get client dashboard data
   */
  getClientDashboard: async (clientId) => {
    return await api.get(`/dashboard/client/${clientId}`);
  },

  /**
   * Get trainer dashboard data
   */
  getTrainerDashboard: async (trainerId) => {
    return await api.get(`/dashboard/trainer/${trainerId}`);
  },

  /**
   * Get admin dashboard data
   */
  getAdminDashboard: async () => {
    return await api.get('/dashboard/admin');
  },

  /**
   * Get gym owner dashboard data
   */
  getGymOwnerDashboard: async (gymId) => {
    return await api.get(`/dashboard/gym/${gymId}`);
  }
};

export default dashboardService;
