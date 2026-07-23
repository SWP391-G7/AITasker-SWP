/**
 * Frontend module: Services/proposalService.js
 *
 * Vai trò: Service proposal Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get my proposals”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getMyProposals = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch proposals.');
  }

  return result.proposals || [];
};

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “create proposal”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const createProposal = async ({ jobId, coverLetter, bidAmount, deliveryDays }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      job_id: jobId,
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

    throw new Error(fieldErrors || result.message || 'Failed to submit proposal.');
  }

  return result.proposal || result.data || result;
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update proposal status”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const updateProposalStatus = async ({ proposalId, status, start_project }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, start_project }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Failed to ${status} proposal.`);
  }

  return result;
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get proposal by id”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getProposalById = async (proposalId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch proposal details.');
  }

  return result.proposal;
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update proposal”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const updateProposal = async ({ proposalId, coverLetter, bidAmount, deliveryDays }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cover_letter: coverLetter,
      bid_amount: bidAmount,
      delivery_days: deliveryDays,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update proposal.');
  }

  return result.proposal || result.data || result;
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “delete proposal”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const deleteProposal = async (proposalId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete proposal.');
  }

  return result;
};

// Thực hiện phần logic “counter proposal” trong phạm vi trách nhiệm của module hiện tại.
export const counterProposal = async ({ proposalId, bidAmount, coverLetter }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/counter`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bid_amount: bidAmount,
      cover_letter: coverLetter,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to counter proposal.');
  }

  return result.proposal || result.data || result;
};

// Thực hiện phần logic “initiate proposal payment” trong phạm vi trách nhiệm của module hiện tại.
export const initiateProposalPayment = async (proposalId, paymentSource = 'card') => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE_URL}/payment/pay-proposal/${proposalId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ payment_source: paymentSource }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to initiate proposal payment.');
  }

  return result;
};
