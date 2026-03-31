import axios from "./axios.customize";

const NotificationService = {
  
  getMyNotifications: async () => {
    try {
      const response = await axios.get('/api/notifications');
      return response.data;
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
      throw error;
    }
  },

  
  markAsRead: async (id) => {
    try {
      const response = await axios.put(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error(`Error marking notification ${id} as read:`, error);
      }
      throw error;
    }
  },

  
  markAllAsRead: async () => {
    try {
      const response = await axios.put('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error('Error marking all notifications as read:', error);
      }
      throw error;
    }
  }
};

export default NotificationService;
