import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale } from 'lucide-react'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import DisputeResolutionView from '../../../Components/Dashboard/Admin/DisputeResolution/DisputeResolutionView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import '../Style/AdminDashboardPage.css'
import '../Style/DisputeResolutionPage.css'

const DisputeResolutionPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)

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
        <AdminHeader
          title="Dispute Resolution"
          subtitle="Manage and resolve conflicts between clients and AI experts."
          headerActions={
            <button type="button" className="btn-approve admin-header-action-button">
              <Scale size={16} />
              Open Cases
            </button>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search cases, clients, or experts..."
          onLogout={handleLogout}
        />
        <DisputeResolutionView searchQuery={searchQuery} />
        <Footer
          brand="AITasker"
          variant="dashboard"
        />
      </main>
    </div>
  )
}

export default DisputeResolutionPage

