/**
 * Frontend module: Services/reviewService.js
 *
 * Vai trò: Service review Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get reviews by target id”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getReviewsByTargetId = async (targetId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/target/${targetId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch reviews');
  }

  return result;
};

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “create review”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const createReview = async ({ target_id, review, stars }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ target_id, review, stars })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create review');
  }

  return result;
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “check can review”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const checkCanReview = async (serviceId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { canReview: false, hasReviewed: false };
  }

  const response = await fetch(`${API_BASE_URL}/reviews/can-review/${serviceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return { canReview: false, hasReviewed: false };
  }

  const result = await response.json();
  return { canReview: result.canReview, hasReviewed: result.hasReviewed };
};
