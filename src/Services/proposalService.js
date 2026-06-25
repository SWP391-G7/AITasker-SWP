const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const createProposal = async (data) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit proposal')
    }

    return result
  } catch (error) {
    console.error('Create proposal error:', error)
    throw error
  }
}

export const getProposalByJob = async (jobId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/proposals/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch proposal')
    }

    return result
  } catch (error) {
    console.error('Get proposal by job error:', error)
    throw error
  }
}

export const updateProposal = async (id, data) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update proposal')
    }

    return result
  } catch (error) {
    console.error('Update proposal error:', error)
    throw error
  }
}

export const deleteProposal = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete proposal')
    }

    return result
  } catch (error) {
    console.error('Delete proposal error:', error)
    throw error
  }
}
