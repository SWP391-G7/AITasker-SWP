/**
 * Frontend module: Services/jobService.js
 *
 * Vai trò: Service job Service: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “create job post”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
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

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get my jobs”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
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

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get job by id”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
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

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get job proposals”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
export const getJobProposals = async (jobId) => {
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

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “update job post”; cần giữ validation và quyền truy cập trước khi cập nhật.
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

// Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “delete job post”; cần giữ validation và quyền truy cập trước khi cập nhật.
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