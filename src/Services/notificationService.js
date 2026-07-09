const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getNotifications = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch notifications.');
  }

  return {
    notifications: result.notifications || [],
    unreadCount: result.unreadCount || 0
  };
};

export const markNotificationAsRead = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found.');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to mark notification as read.');
  }

  return result.notification;
};

export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found.');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to mark all notifications as read.');
  }

  return result;
};
