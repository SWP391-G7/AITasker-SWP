const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Cập nhật role người dùng
 */
export const updateRole = async (role) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/profile/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update role');
  }

  // Cập nhật localStorage
  if (result.user) {
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  
  if (result.token) {
    localStorage.setItem('token', result.token);
  }

  return result;
};

/**
 * Hoàn tất onboarding cho Client
 */
export const submitClientOnboarding = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/profile/client`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Client onboarding failed');
  }

  // Đánh dấu đã onboarded trong localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.isOnboarded = true;
  localStorage.setItem('user', JSON.stringify(user));

  return result;
};

/**
 * Hoàn tất onboarding cho Expert
 */
export const submitExpertOnboarding = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/profile/expert`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Expert onboarding failed');
  }

  // Đánh dấu đã onboarded trong localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.isOnboarded = true;
  localStorage.setItem('user', JSON.stringify(user));

  return result;
};
