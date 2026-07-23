/**
 * Frontend module: Components/Dashboard/Admin/adminNavigation.js
 *
 * Vai trò: Component admin Navigation: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// Handler “handle admin tab change” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
export const handleAdminTabChange = (tabId, navigate, setActiveTab) => {
  if (tabId === 'dashboard') {
    navigate('/admin/dashboard')
    return
  }

  if (tabId === 'users') {
    navigate('/admin/users')
    return
  }

  if (tabId === 'moderation') {
    navigate('/admin/moderation')
    return
  }

  if (tabId === 'disputes') {
    navigate('/admin/disputes')
    return
  }

  if (tabId === 'analytics') {
    navigate('/admin/analytics')
    return
  }

  if (setActiveTab) {
    setActiveTab(tabId)
  }
}
