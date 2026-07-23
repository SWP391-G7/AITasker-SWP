/**
 * Frontend module: pages/misc/DeactivatedPage.jsx
 *
 * Vai trò: Page Deactivated Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, LogOut, Mail } from 'lucide-react'
import '../Style/DeactivatedPage.css' // We will create this styling file

// React component “Deactivated Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const DeactivatedPage = () => {
  const navigate = useNavigate()

  // Handler “handle return home” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleReturnHome = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="deactivated-container">
      <div className="deactivated-card">
        <div className="deactivated-icon-wrapper">
          <ShieldAlert className="deactivated-icon" size={64} />
        </div>
        
        <h1 className="deactivated-title">Account Deactivated</h1>
        
        <div className="deactivated-divider" />
        
        <p className="deactivated-message">
          We regret to inform you that your account has been suspended due to a violation of <strong>AITasker</strong>'s terms of service or community guidelines.
        </p>

        <div className="deactivated-support-info">
          <Mail size={16} className="support-icon" />
          <span>Support: <strong>support@aitasker.com</strong></span>
        </div>

        <button 
          type="button" 
          className="deactivated-btn" 
          onClick={handleReturnHome}
        >
          <LogOut size={16} />
          <span>Back to Homepage</span>
        </button>
      </div>
    </div>
  )
}

export default DeactivatedPage

