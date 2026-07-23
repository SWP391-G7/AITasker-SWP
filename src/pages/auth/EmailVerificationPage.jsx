/**
 * Frontend module: pages/auth/EmailVerificationPage.jsx
 *
 * Vai trò: Page Email Verification Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../Components/Auth/AuthLayout'
import EmailVerification from '../../Components/Auth/EmailVerificationForm'

import '../../Components/Auth/Auth.css'

/** Pull email from localStorage-stored user when no state email is passed. */
function getStoredEmail() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    // The stored object may be the full getMe response { user: { email } }
    // or a flat user object { email } depending on where it was saved.
    return parsed?.user?.email || parsed?.email || ''
  } catch {
    return ''
  }
}

// React component “Email Verification Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const EmailVerificationPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [userEmail] = useState(location.state?.email || getStoredEmail())
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Email is passed from registration form via location.state
    if (!location.state?.email) {
      console.warn('No email in location state — falling back to stored user email')
    }
  }, [location.state])

  // Handle verification success from child component
  const handleVerificationSuccess = () => {
    setShowSuccess(true)
  }

  return (
    <AuthLayout>
      <EmailVerification 
        email={userEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />

      {/* Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <i className="bi bi-check-lg"></i>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
            </div>
            <h2 className="fw-bold mb-2">Verified!</h2>
            <p className="text-muted mb-4">
              Your email <span className="text-dark fw-bold">{userEmail}</span> has been successfully verified.
            </p>
            <button
              className="btn btn-primary w-100 btn-lg rounded-pill"
              onClick={() => navigate('/onboarding')}
            >
              Continue to Onboarding
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

export default EmailVerificationPage

