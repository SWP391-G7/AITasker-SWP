/**
 * Frontend module: App.jsx
 *
 * Vai trò: App: thành phần nền tảng của ứng dụng React.
 * Luồng chính: Thiết lập style, provider, root render hoặc cấu hình dùng chung cho toàn bộ frontend.
 * Lưu ý bảo trì: Thay đổi tại đây có thể ảnh hưởng nhiều màn hình nên cần kiểm tra toàn bộ luồng chính.
 */
import AdminDashboardPage from "./pages/DashboardPage/Admin/AdminDashboardPage";
import UserManagementPage from "./pages/DashboardPage/Admin/UserManagementPage";
import AppRoutes from "./routes/AppRoutes"

// React component “App” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function App() {
  return (
    <AppRoutes/>
  );
}

export default App
