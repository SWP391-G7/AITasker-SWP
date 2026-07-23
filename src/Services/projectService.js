/**
 * Frontend module: Services/projectService.js
 *
 * Vai trò: Service project Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
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
export const approveMilestonePlan = async (projectId, approveDurationExtension = false) => {
  const response = await fetch(`${API_BASE_URL}/milestones/project/${projectId}/approve-plan`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ approve_duration_extension: approveDurationExtension })
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

// Thực hiện phần logic “request milestone extension” trong phạm vi trách nhiệm của module hiện tại.
export const requestMilestoneExtension = async (milestoneId, additionalDays, reason) => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/request-extension`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ additional_days: additionalDays, reason })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to request deadline extension.');
  return result;
};

// Thực hiện phần logic “respond milestone extension” trong phạm vi trách nhiệm của module hiện tại.
export const respondMilestoneExtension = async (milestoneId, action, note = '') => {
  const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/respond-extension`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, note })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to respond to deadline extension.');
  return result;
};

/**
 * File/raise a dispute for a project
 */
export const raiseProjectDispute = async (projectId, disputeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/dispute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(disputeData)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to file dispute.');
    return result;
  } catch (error) {
    console.error('Raise project dispute error:', error);
    throw error;
  }
};

/**
 * Get dispute details for a project if any
 */
export const getProjectDisputeStatus = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/dispute`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to retrieve dispute details.');
    return result.dispute || null;
  } catch (error) {
    console.error('Get project dispute error:', error);
    throw error;
  }
};


