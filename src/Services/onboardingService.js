/**
 * Frontend module: Services/onboardingService.js
 *
 * Vai trò: Service onboarding Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “submit client onboarding”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
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
        industry: data.industry,
        bio: data.bio || ''
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Client onboarding failed')
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.isOnboarded = true
    localStorage.setItem('user', JSON.stringify(user))

    return result
  } catch (error) {
    console.error('Client onboarding error:', error)
    throw error
  }
}

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “submit expert onboarding”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
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

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.isOnboarded = true
    localStorage.setItem('user', JSON.stringify(user))

    return result
  } catch (error) {
    console.error('Expert onboarding error:', error)
    throw error
  }
}

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update user role”; cần giữ validation và quyền truy cập trước khi cập nhật.
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

    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user))
    }

    return result
  } catch (error) {
    console.error('Update user role error:', error)
    throw error
  }
}
