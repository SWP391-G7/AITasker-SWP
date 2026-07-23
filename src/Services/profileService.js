/**
 * Frontend module: Services/profileService.js
 *
 * Vai trò: Service profile Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get user profile”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch profile');
    }

    // Admin profile views need the canonical moderation status so approved/open
    // content can expose the Unpublish action. Keep the public profile endpoint
    // lightweight, then enrich its items only for an authenticated admin.
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      storedUser = null;
    }

    const isAdmin = String(storedUser?.role || '').toLowerCase().includes('admin');
    if (token && isAdmin) {
      try {
        const moderationResponse = await fetch(`${API_BASE_URL}/admin/content?type=all&status=all`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (moderationResponse.ok) {
          const moderationData = await moderationResponse.json();
          const serviceStatuses = new Map(
            (moderationData.services || []).map((service) => [String(service.id), service.status])
          );
          const projectStatuses = new Map(
            (moderationData.jobs || []).map((project) => [String(project.id), project.status])
          );

          result.services = (result.services || []).map((service) => ({
            ...service,
            status: serviceStatuses.get(String(service.id)) || service.status
          }));
          result.projects = (result.projects || []).map((project) => ({
            ...project,
            status: projectStatuses.get(String(project.id)) || project.status
          }));
        }
      } catch (moderationError) {
        console.error('Failed to enrich profile moderation statuses:', moderationError);
      }
    }

    return result;
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update own user field”; cần giữ validation và quyền truy cập trước khi cập nhật.
const updateOwnUserField = async (path, body) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update account profile');
  }

  return result.user;
};

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update own full name”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const updateOwnFullName = (fullName) =>
  updateOwnUserField('/users/update-fullname', { fullName });

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update own avatar”; cần giữ validation và quyền truy cập trước khi cập nhật.
export const updateOwnAvatar = (avatarUrl) =>
  updateOwnUserField('/users/update-avatar', { avatarUrl });

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get reviews by target id”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getReviewsByTargetId = async (targetId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/target/${targetId}`);
    const result = await response.json();
    return result.reviews || [];
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return [];
  }
};

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “submit review”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const submitReview = async (target_id, review) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please log in to write a review');
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ target_id, review })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to submit review');
    return result.review;
  } catch (error) {
    console.error('Submit review error:', error);
    throw error;
  }
};
