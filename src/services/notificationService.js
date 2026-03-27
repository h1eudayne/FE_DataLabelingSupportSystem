import axios from "./axios.customize";

const NotificationService = {
  // Get the latest notifications for the current user
  getMyNotifications: async () => {
    try {
      const response = await axios.get('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark a single notification as read
  markAsRead: async (id) => {
    try {
      const response = await axios.put(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await axios.put('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};

export default NotificationService;

