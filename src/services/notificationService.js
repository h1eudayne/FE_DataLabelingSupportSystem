import api from '../api';

const NotificationService = {
  // Lấy các thông báo mới nhất của người dùng
  getMyNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
      throw error;
    }
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi đánh dấu đã đọc thông báo ${id}:`, error);
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc tất cả thông báo:', error);
      throw error;
    }
  }
};

export default NotificationService;
