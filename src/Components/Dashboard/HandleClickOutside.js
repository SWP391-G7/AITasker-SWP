/**
 * Frontend module: Components/Dashboard/HandleClickOutside.js
 *
 * Vai trò: Component Handle Click Outside: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useEffect, useRef, useState } from 'react'

// Custom hook “use handle click outside” quản lý lifecycle/state dùng lại và phải cleanup tài nguyên khi unmount.
const useHandleClickOutside = (initialOpen = false) => {
  const [isProfileOpen, setIsProfileOpen] = useState(initialOpen)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Handler “handle click outside” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return { isProfileOpen, setIsProfileOpen, dropdownRef }
}

export default useHandleClickOutside
