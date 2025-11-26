import api from './api';

/**
 * Booking & Schedule API Service
 */

export const bookingService = {
  /**
   * Create a new booking with validation
   */
  createBooking: async (bookingData) => {
    return await api.post('/bookings/validated', bookingData);
  },

  /**
   * Get bookings (filtered by user role automatically)
   */
  getBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/bookings?${params}`);
  },

  /**
   * Get booking by ID
   */
  getBooking: async (bookingId) => {
    return await api.get(`/bookings/${bookingId}`);
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId, reason = null) => {
    return await api.put(`/bookings/${bookingId}/cancel`, {
      cancellation_reason: reason
    });
  },

  /**
   * Complete a booking (trainer/admin only)
   */
  completeBooking: async (bookingId) => {
    return await api.put(`/bookings/${bookingId}/complete`);
  },

  /**
   * Get trainer availability
   */
  getTrainerAvailability: async (trainerId) => {
    return await api.get(`/availability/trainer/${trainerId}`);
  },

  /**
   * Create availability slot (trainer only)
   */
  createAvailability: async (availabilityData) => {
    return await api.post('/availability', availabilityData);
  },

  /**
   * Delete availability slot
   */
  deleteAvailability: async (availabilityId) => {
    return await api.delete(`/availability/${availabilityId}`);
  },

  /**
   * Get group sessions
   */
  getGroupSessions: async (page = 1, limit = 20) => {
    return await api.get(`/sessions/group?page=${page}&limit=${limit}`);
  },

  /**
   * Create group session (trainer only)
   */
  createGroupSession: async (sessionData) => {
    return await api.post('/sessions/group', sessionData);
  },

  /**
   * Enroll in group session
   */
  enrollInGroupSession: async (sessionId) => {
    return await api.post(`/sessions/group/${sessionId}/enroll`);
  }
};

export default bookingService;
