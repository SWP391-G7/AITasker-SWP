import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import DisputeResolutionView from '../../../Components/Dashboard/Admin/DisputeResolution/DisputeResolutionView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import '../../Style/AdminDashboardPage.css'
import '../../Style/DisputeResolutionPage.css'

const DisputeResolutionPage = ({ onLogout }) => {
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
        activeTab="disputes"
        onTabChange={(tabId) => handleAdminTabChange(tabId, navigate)}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel dispute-resolution-main">
        <DisputeResolutionView />
        <Footer
          brand="AITasker"
          variant="dashboard"
        />
      </main>
    </div>
  )
}

export default DisputeResolutionPage
