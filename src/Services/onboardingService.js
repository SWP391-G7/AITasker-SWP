const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const submitClientOnboarding = async (data) => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/profile/client`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        companyName: data.companyName,
        industry: data.industry
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Client onboarding failed')
    }

    return result
  } catch (error) {
    console.error('Client onboarding error:', error)
    throw error
  }
}

export const submitExpertOnboarding = async (data) => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/profile/expert`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        professionalTitle: data.professionalTitle,
        skills: data.skills,
        experience: data.experience,
        portfolioUrl: data.portfolioUrl,
        hourlyRate: data.hourlyRate,
        bio: data.bio || ''
      })
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Expert onboarding failed')
    }
    return result
  } catch (error) {
    console.error('Expert onboarding error:', error)
    throw error
  }
}

export const updateUserRole = async (role) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/profile/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Updating role failed')
    }

    if (result.token) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
    }

    return result
  } catch (error) {
    console.error('Update user role error:', error)
    throw error
  }
}
