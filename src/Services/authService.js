/**
 * Frontend module: Services/authService.js
 *
 * Vai trò: Service auth Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “register”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
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

// Thực hiện phần logic “login” trong phạm vi trách nhiệm của module hiện tại.
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

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get me”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
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

      // Seed isOnboarded from localStorage so the value written by
      // submitClientOnboarding / submitExpertOnboarding is honoured as a
      // fallback.  The server profile-check below will override it if it
      // succeeds; it will NOT reset it to false if the fetch fails.
      let isOnboarded = false
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        isOnboarded = stored.isOnboarded ?? false
      } catch (_) { /* ignore */ }

      if (user.role === 'admin') {
        isOnboarded = true
      } else {
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
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
          // If profileResponse is NOT ok, isOnboarded retains the localStorage fallback
        } catch (profileErr) {
          console.error('Failed to check onboarding profile:', profileErr)
          // isOnboarded retains the localStorage fallback
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

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “send verification code”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
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

// Thực hiện phần logic “verify code” trong phạm vi trách nhiệm của module hiện tại.
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

// Thực hiện phần logic “forgot password” trong phạm vi trách nhiệm của module hiện tại.
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send password reset code')
    }

    return result
  } catch (error) {
    console.error('Forgot password error:', error)
    throw error
  }
}

// Thực hiện phần logic “verify password reset code” trong phạm vi trách nhiệm của module hiện tại.
export const verifyPasswordResetCode = async ({ email, code }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to verify password reset code')
    }

    return result
  } catch (error) {
    console.error('Verify password reset code error:', error)
    throw error
  }
}

// Thực hiện phần logic “reset password” trong phạm vi trách nhiệm của module hiện tại.
export const resetPassword = async ({ email, code, newPassword }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, newPassword })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to reset password')
    }

    return result
  } catch (error) {
    console.error('Reset password error:', error)
    throw error
  }
}

// Thực hiện phần logic “google login” trong phạm vi trách nhiệm của module hiện tại.
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

// Thực hiện phần logic “logout” trong phạm vi trách nhiệm của module hiện tại.
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
