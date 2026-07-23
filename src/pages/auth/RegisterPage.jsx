/**
 * Frontend module: pages/auth/RegisterPage.jsx
 *
 * Vai trò: Page Register Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import AuthLayout from "../../Components/Auth/AuthLayout";
import RegisterForm from "../../Components/Auth/RegisterForm";

// Tạo hoặc gửi dữ liệu cho nghiệp vụ “register page”, đồng thời chuyển lỗi về caller/UI theo cơ chế của module.
function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}

export default RegisterPage;

