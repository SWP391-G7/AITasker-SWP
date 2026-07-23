/**
 * Frontend module: Services/checkLogin.js
 *
 * Vai trò: Service check Login: lớp giao tiếp giữa UI và backend API.
 * Luồng chính: Nhận dữ liệu từ component, gắn token/header, gọi endpoint, chuẩn hóa response và ném Error khi request thất bại.
 * Lưu ý bảo trì: Component không nên lặp lại URL hoặc logic HTTP đã được đóng gói tại đây.
 */
import * as authService from './authService'

export async function checkLogin() {
    try {
        const token = localStorage.getItem("token")
        
        if (!token) {
            return {
                isLoggedIn: false,
                user: null,
                error: "No authentication token found"
            }
        }

        // Verify token with backend
        const user = await authService.getMe()
        
        return {
            isLoggedIn: true,
            user: user,
            error: null
        }
    } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        
        return {
            isLoggedIn: false,
            user: null,
            error: error.message || "Failed to verify login status"
        }
    }
}

export function getStoredUser() {
    try {
        const userJson = localStorage.getItem("user")
        return userJson ? JSON.parse(userJson) : null
    } catch (error) {
        console.error("Error parsing stored user:", error)
        return null
    }
}

export function isLoggedIn() {
    const token = localStorage.getItem("token")
    return !!token
}

export function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}