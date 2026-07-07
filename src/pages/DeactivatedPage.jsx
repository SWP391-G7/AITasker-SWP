import { useNavigate } from 'react-router-dom'
import { ShieldAlert, LogOut, Mail } from 'lucide-react'
import '../pages/Style/DeactivatedPage.css' // We will create this styling file

const DeactivatedPage = () => {
  const navigate = useNavigate()

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
