import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import AnalyticsView from '../../../Components/Dashboard/Admin/Analytics/AnalyticsView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import '../../Style/AdminDashboardPage.css'
import '../../Style/AnalyticsPage.css'

const AnalyticsPage = ({ onLogout }) => {
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
        activeTab="analytics"
        onTabChange={(tabId) => handleAdminTabChange(tabId, navigate)}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel analytics-main">
        <AnalyticsView />
        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default AnalyticsPage
