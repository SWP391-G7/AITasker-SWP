const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const createJobPost = async (data) => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      const detailMsg = result.errors
        ? Object.values(result.errors).join('; ')
        : result.message
      throw new Error(detailMsg || 'Failed to create job post')
    }

    return result
  } catch (error) {
    console.error('Create job post error:', error)
    throw error
  }
}

export const getMyJobs = async () => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/jobs/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch user jobs')
    }

    return result
  } catch (error) {
    console.error('Get user jobs error:', error)
    throw error
  }
}

export const getJobById = async (jobId) => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch job')
    }

    return result
  } catch (error) {
    console.error('Get job error:', error)
    throw error
   }
}

export const getJobProposals = async (jobId) => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/proposals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()
    
    if (response.status === 404) {
      return { success: true, proposals: [], data: [] }
    }

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch proposals')
    }

    return result
  } catch (error) {
    console.error('Get job proposals error:', error)
    throw error
  }
}

export const updateJobPost = async (jobId, data) => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update job post')
    }

    return result
  } catch (error) {
    console.error('Update job post error:', error)
    throw error
  }
}

export const deleteJobPost = async (jobId) => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete job post')
    }

    return result
  } catch (error) {
    console.error('Delete job post error:', error)
    throw error
  }
}