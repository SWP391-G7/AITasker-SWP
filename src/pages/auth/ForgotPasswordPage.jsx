/**
 * Frontend module: pages/auth/ForgotPasswordPage.jsx
 *
 * Vai trò: Page Forgot Password Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import AuthLayout from "../../Components/Auth/AuthLayout"
import ForgotPasswordForm from "../../Components/Auth/ForgotPasswordForm"

// React component “Forgot Password Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

export default ForgotPasswordPage

