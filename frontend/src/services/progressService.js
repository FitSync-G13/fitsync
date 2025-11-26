import api from './api';

/**
 * Progress Tracking API Service
 */

export const progressService = {
  /**
   * Record body metrics
   */
  recordMetrics: async (metricsData) => {
    return await api.post('/metrics', metricsData);
  },

  /**
   * Get client metrics history
   */
  getClientMetrics: async (clientId, page = 1, limit = 50) => {
    return await api.get(`/metrics/client/${clientId}?page=${page}&limit=${limit}`);
  },

  /**
   * Get latest metrics for a client
   */
  getLatestMetrics: async (clientId) => {
    return await api.get(`/metrics/client/${clientId}/latest`);
  },

  /**
   * Get metrics chart data
   */
  getMetricsChartData: async (clientId, metric = 'weight_kg', days = 90) => {
    return await api.get(`/metrics/client/${clientId}/chart?metric=${metric}&days=${days}`);
  },

  /**
   * Log a workout
   */
  logWorkout: async (workoutData) => {
    return await api.post('/workout-logs', workoutData);
  },

  /**
   * Get workout logs for a client
   */
  getWorkoutLogs: async (clientId, page = 1, limit = 20) => {
    return await api.get(`/workout-logs/client/${clientId}?page=${page}&limit=${limit}`);
  },

  /**
   * Get workout log by ID
   */
  getWorkoutLog: async (logId) => {
    return await api.get(`/workout-logs/${logId}`);
  },

  /**
   * Add health record
   */
  addHealthRecord: async (recordData) => {
    return await api.post('/health-records', recordData);
  },

  /**
   * Get health records for a client
   */
  getHealthRecords: async (clientId) => {
    return await api.get(`/health-records/client/${clientId}`);
  },

  /**
   * Get client analytics
   */
  getClientAnalytics: async (clientId) => {
    return await api.get(`/analytics/client/${clientId}`);
  },

  /**
   * Get achievements for a client
   */
  getAchievements: async (clientId) => {
    return await api.get(`/achievements/client/${clientId}`);
  }
};

export default progressService;
