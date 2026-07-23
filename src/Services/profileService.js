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
