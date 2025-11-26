import api from './api';

/**
 * Training Program API Service
 */

export const programService = {
  /**
   * Get all programs (filtered by user role)
   */
  getPrograms: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/programs?${params}`);
  },

  /**
   * Get active programs for a client
   */
  getActivePrograms: async (clientId) => {
    return await api.get(`/programs/client/${clientId}/active`);
  },

  /**
   * Get program by ID
   */
  getProgram: async (programId) => {
    return await api.get(`/programs/${programId}`);
  },

  /**
   * Create new program (trainer/admin only)
   */
  createProgram: async (programData) => {
    return await api.post('/programs', programData);
  },

  /**
   * Update program status
   */
  updateProgramStatus: async (programId, status) => {
    return await api.put(`/programs/${programId}/status`, { status });
  },

  /**
   * Complete a program
   */
  completeProgram: async (programId, adherenceRate = null) => {
    return await api.post(`/programs/${programId}/complete`, {
      adherence_rate: adherenceRate
    });
  }
};

export default programService;
