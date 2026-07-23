/**
 * Frontend module: Services/invitationService.js
 *
 * Vai trò: Service invitation Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get my invitations”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getMyInvitations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch requests.');
  }

  return result.invitations || [];
};

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “create invitation”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const createInvitation = async ({ serviceId, coverLetter, bidAmount, deliveryDays }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      service_id: serviceId,
      cover_letter: coverLetter,
      bid_amount: bidAmount,
      delivery_days: deliveryDays,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    const fieldErrors = result.errors
      ? Object.entries(result.errors).map(([field, message]) => `${field}: ${message}`).join('\n')
      : '';
    throw new Error(fieldErrors || result.message || 'Failed to send request.');
  }

  return result.invitation;
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get invitation by id”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getInvitationById = async (invitationId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch request details.');
  }

  return result.invitation;
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update invitation status”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const updateInvitationStatus = async ({ invitationId, status, start_project }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, start_project }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Failed to ${status} request.`);
  }

  return result;
};

// Thực hiện phần logic “counter invitation” trong phạm vi trách nhiệm của module hiện tại.
export const counterInvitation = async ({ invitationId, bidAmount, deliveryDays, coverLetter }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/counter`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bid_amount: bidAmount,
      delivery_days: deliveryDays,
      cover_letter: coverLetter,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to submit counter offer.');
  }

  return result.invitation;
};

// Thực hiện phần logic “start project from invitation” trong phạm vi trách nhiệm của module hiện tại.
export const startProjectFromInvitation = async (invitationId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/start-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to start project.');
  }

  return result.project;
};

// Thực hiện phần logic “initiate invitation payment” trong phạm vi trách nhiệm của module hiện tại.
export const initiateInvitationPayment = async (invitationId, paymentSource = 'card') => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found. Please log in first.');
  const response = await fetch(`${API_BASE_URL}/payment/pay-invitation/${invitationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ payment_source: paymentSource }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to initiate service payment.');
  return result;
};
