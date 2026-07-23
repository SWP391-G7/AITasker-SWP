/**
 * Frontend module: pages/DashboardPage/Expert/handleLogout.js
 *
 * Vai trò: Page handle Logout: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { logout } from '../../../Services/authService'

// Handler “handle logout” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
export const handleLogout = (navigate) => {
  logout()
  navigate('/')
}

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “create handle logout”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
export const createHandleLogout = (navigate) => () => handleLogout(navigate)
