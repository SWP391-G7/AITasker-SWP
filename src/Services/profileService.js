const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    return result;
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
};

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
