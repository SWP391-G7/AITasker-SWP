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
 * Start payment for a milestone (now expects pending_payment status)
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

// ── Milestone Lifecycle (new) ─────────────────────────────────────────────────

/**
 * Bulk-create and submit a milestone plan for client review
 * @param {string} projectId
 * @param {{ title, content, amount, delivery_days }[]} milestones
 */
export const submitMilestonePlan = async (projectId, milestones) => {
  const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}/submit-plan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ milestones })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to submit milestone plan.');
  return result;
};

/**
 * Client approves the submitted milestone plan (all planning → planned)
 */
export const approveMilestonePlan = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}/approve-plan`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to approve milestone plan.');
  return result;
};

/**
 * Client requests changes to the plan with per-milestone notes
 * @param {string} projectId
 * @param {{ [milestoneId]: string }} notes
 */
export const requestMilestonePlanChanges = async (projectId, notes) => {
  const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}/request-changes`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to request plan changes.');
  return result;
};

/**
 * Expert starts a planned milestone (computes deadline)
 */
export const startMilestone = async (milestoneId) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/start`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to start milestone.');
  return result;
};

/**
 * Expert submits a deliverable link for an ongoing/revision-requested milestone
 * @param {string} milestoneId
 * @param {{ deliverable_url: string, deliverable_note?: string }} data
 */
export const submitDeliverable = async (milestoneId, { deliverable_url, deliverable_note }) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/submit-deliverable`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ deliverable_url, deliverable_note })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to submit deliverable.');
  return result;
};

/**
 * Client approves a submitted deliverable (submitted → pending_payment)
 */
export const approveDeliverable = async (milestoneId) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/approve-deliverable`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to approve deliverable.');
  return result;
};

/**
 * Client requests revision on a submitted deliverable
 * @param {string} milestoneId
 * @param {string} note
 */
export const requestRevision = async (milestoneId, note) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/request-revision`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ note })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to request revision.');
  return result;
};

/**
 * Client approves a milestone (Planning -> Approved, or On-going -> Wait for payment)
 */
export const approveMilestone = async (milestoneId) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to approve milestone.');
  return result;
};

/**
 * Client declines a milestone (status -> Declined)
 */
export const declineMilestone = async (milestoneId) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/decline`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to decline milestone.');
  return result;
};

/**
 * Client submits response note for a declined milestone
 */
export const submitMilestoneResponse = async (milestoneId, responseText) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/response`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ response: responseText })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to submit response content.');
  return result;
};

/**
 * Expert submits/resubmits content for a milestone
 */
export const submitMilestoneContent = async (milestoneId, content) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/submit-content`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to submit content.');
  return result;
};

/**
 * Client starts project after all milestones are Approved
 */
export const startProject = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}/start`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to start project.');
  return result;
};

