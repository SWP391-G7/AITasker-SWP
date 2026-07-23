/**
 * Frontend module: Components/Dashboard/Client/user.js
 *
 * Vai trò: Component user: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useMemo } from "react";

// Custom hook “use client user” quản lý lifecycle/state dùng lại và phải cleanup tài nguyên khi unmount.
export const useClientUser = () =>
  useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);
