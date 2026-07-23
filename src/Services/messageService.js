/**
 * Frontend module: Services/messageService.js
 *
 * Vai trò: Service message Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get conversations”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getConversations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch conversations.');
  }

  return result.data || [];
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get or create conversation”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getOrCreateConversation = async (targetId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetId }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to get or create conversation.');
  }

  return result.data;
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get conversation messages”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getConversationMessages = async (conversationId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch messages.');
  }

  return result.data || [];
};

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “send message”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const sendMessage = async (conversationId, content) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to send message.');
  }

  return result.data;
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “remove message”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const removeMessage = async (messageId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to remove message.');
  }

  return result.data;
};

