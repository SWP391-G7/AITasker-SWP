/**
 * Frontend module: Services/transactionService.js
 *
 * Vai trò: Service transaction Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get auth headers”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get my transactions api”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getMyTransactionsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve transactions.');
    }
    return result; // contains { success, transactions, stats: { totalLifetime, availableNow, pendingClearance, inEscrow } }
  } catch (error) {
    console.error('Get my transactions error:', error);
    throw error;
  }
};
