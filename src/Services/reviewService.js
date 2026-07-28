const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Get all reviews for a target user (expert or client)
 * @param {string} targetId 
 */
export const getReviewsByTargetId = async (targetId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/target/${targetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reviews');
    }

    return data.reviews || [];
  } catch (error) {
    console.error('getReviewsByTargetId Error:', error);
    throw error;
  }
};

/**
 * Submit a review for a user or project
 * @param {Object} reviewData 
 */
export const createReview = async (reviewData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit review');
    }

    return data;
  } catch (error) {
    console.error('createReview Error:', error);
    throw error;
  }
};

/**
 * Check if the current user can review a target/service
 * @param {string} targetId 
 */
export const checkCanReview = async (targetId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { canReview: false, hasReviewed: false };
    const response = await fetch(`${API_BASE_URL}/reviews/can-review/${targetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      return { canReview: false, hasReviewed: false };
    }
    const data = await response.json();
    return {
      canReview: Boolean(data.canReview),
      hasReviewed: Boolean(data.hasReviewed)
    };
  } catch {
    return { canReview: false, hasReviewed: false };
  }
};
