const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Creates a new job post in the backend.
 * @param {Object} jobData - The job post form data
 */
export const createJobPost = async (jobData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not logged in. No token found.');
    }

    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: jobData.title,
        description: jobData.description,
        budgetMin: jobData.budgetMin,
        budgetMax: jobData.budgetMax,
        requiredSkill: jobData.requiredSkill,
        durationDays: jobData.durationDays,
        deadline: jobData.deadline
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create job post.');
    }

    return result;
  } catch (error) {
    console.error('Create Job API Error:', error);
    throw error;
  }
};

/**
 * Retrieves all job posts created by the current user.
 */
export const getMyJobs = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not logged in. No token found.');
    }

    const response = await fetch(`${API_BASE_URL}/jobs/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve your jobs.');
    }

    return result.jobPosts || [];
  } catch (error) {
    console.error('Get My Jobs API Error:', error);
    throw error;
  }
};
