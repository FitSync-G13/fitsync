import api from './api';

/**
 * Notification API Service
 */

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async (userId) => {
    return await api.get(`/notifications?user_id=${userId}`);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (userId) => {
    return await api.get(`/notifications/unread/count?user_id=${userId}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId, userId) => {
    return await api.put(`/notifications/${notificationId}/read?user_id=${userId}`);
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId, userId) => {
    return await api.delete(`/notifications/${notificationId}?user_id=${userId}`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userId) => {
    const notifications = await api.get(`/notifications?user_id=${userId}`);
    if (notifications.data) {
      const promises = notifications.data
        .filter(n => !n.read_at)
        .map(n => api.put(`/notifications/${n.id}/read?user_id=${userId}`));
      await Promise.all(promises);
    }
  }
};

export default notificationService;
