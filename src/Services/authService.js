const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const register = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'client'  // Default role, will be customizable later
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed')
    }

    // Don't save token yet - only save after email verification and login
    return result
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export const login = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    })

    const result = await response.json()

    if (!response.ok) {
      const error = new Error(result.message || 'Login failed')
      error.isVerificationRequired = result.isVerificationRequired || false
      error.email = result.email || data.email
      error.statusCode = response.status
      error.code = result.code || null
      throw error
    }

    if (result.token) {
      localStorage.setItem('token', result.token)

      let isOnboarded = false
      const user = result.user

      if (user.role === 'admin') {
        isOnboarded = true
      } else {
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${result.token}`
            }
          })
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (user.role === 'client') {
              isOnboarded = !!profileData.hasClientProfile
            } else if (user.role === 'expert') {
              isOnboarded = !!profileData.hasExpertProfile
            }
          }
        } catch (profileErr) {
          console.error('Failed to check onboarding profile:', profileErr)
        }
      }

      user.isOnboarded = isOnboarded
      localStorage.setItem('user', JSON.stringify(user))
      result.user = user
    }

    return result
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const getMe = async () => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch user profile')
    }

    if (result.user) {
      const user = result.user
      let isOnboarded = false

      if (user.role === 'admin') {
        isOnboarded = true
      } else {
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (user.role === 'client') {
              isOnboarded = !!profileData.hasClientProfile
            } else if (user.role === 'expert') {
              isOnboarded = !!profileData.hasExpertProfile
            }
          }
        } catch (profileErr) {
          console.error('Failed to check onboarding profile:', profileErr)
        }
      }

      user.isOnboarded = isOnboarded
      localStorage.setItem('user', JSON.stringify(user))
      result.user = user
    }

    return result
  } catch (error) {
    console.error('Get user error:', error)
    throw error
  }
}

export const sendVerificationCode = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send verification code')
    }

    return result
  } catch (error) {
    console.error('Send verification code error:', error)
    throw error
  }
}

export const verifyCode = async (email, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to verify code')
    }

    return result
  } catch (error) {
    console.error('Verify code error:', error)
    throw error
  }
}

export const googleLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })

    const result = await response.json()

    if (!response.ok) {
      const error = new Error(result.message || 'Google Login failed')
      error.code = result.code || null
      throw error
    }

    if (result.token) {
      localStorage.setItem('token', result.token)

      let isOnboarded = false
      const user = result.user

      if (user.role === 'admin') {
        isOnboarded = true
      } else {
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${result.token}`
            }
          })
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (user.role === 'client') {
              isOnboarded = !!profileData.hasClientProfile
            } else if (user.role === 'expert') {
              isOnboarded = !!profileData.hasExpertProfile
            }
          }
        } catch (profileErr) {
          console.error('Failed to check onboarding profile:', profileErr)
        }
      }

      user.isOnboarded = isOnboarded
      localStorage.setItem('user', JSON.stringify(user))
      result.user = user
    }

    return result
  } catch (error) {
    console.error('Google Login error:', error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
