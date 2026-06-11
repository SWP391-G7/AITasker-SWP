import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import ContentModerationView from '../../../Components/Dashboard/Admin/ContentModeration/ContentModerationView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ContentModerationPage.css'

const ContentModerationPage = ({ onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = onLogout || (() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('email')
    navigate('/')
  })

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar
        activeTab="moderation"
        onTabChange={(tabId) => handleAdminTabChange(tabId, navigate)}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel content-moderation-main">
        <ContentModerationView />
        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default ContentModerationPage
