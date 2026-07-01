const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper function to retrieve authorization header
 */
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

/**
 * Create a new project manually from a pending job post
 */
export const createProject = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ job_id: jobId })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create project.');
    }
    return result;
  } catch (error) {
    console.error('Create project error:', error);
    throw error;
  }
};

/**
 * Get all projects where the user is a participant
 */
export const getMyProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve projects.');
    }
    return result.projects || [];
  } catch (error) {
    console.error('Get my projects error:', error);
    throw error;
  }
};

/**
 * Get project details by project ID
 */
export const getProjectById = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve project details.');
    }
    return result; // contains { success, project, milestones }
  } catch (error) {
    console.error('Get project by id error:', error);
    throw error;
  }
};

/**
 * Close/abandon a project
 */
export const closeProject = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: 'terminated' })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to close project.');
    }
    return result.project;
  } catch (error) {
    console.error('Close project error:', error);
    throw error;
  }
};

/**
 * Create a new milestone for a project
 */
export const createMilestone = async (projectId, milestoneData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(milestoneData)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create milestone.');
    }
    return result.milestone;
  } catch (error) {
    console.error('Create milestone error:', error);
    throw error;
  }
};

/**
 * Update a milestone
 */
export const updateMilestone = async (milestoneId, milestoneData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(milestoneData)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update milestone.');
    }
    return result.milestone;
  } catch (error) {
    console.error('Update milestone error:', error);
    throw error;
  }
};

/**
 * Delete a milestone
 */
export const deleteMilestone = async (milestoneId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete milestone.');
    }
    return result;
  } catch (error) {
    console.error('Delete milestone error:', error);
    throw error;
  }
};

/**
 * Start payment for a milestone
 */
export const payMilestone = async (milestoneId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/pay`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to process milestone payment.');
    }
    return result; // contains { success, milestone, projectCompleted }
  } catch (error) {
    console.error('Pay milestone error:', error);
    throw error;
  }
};
