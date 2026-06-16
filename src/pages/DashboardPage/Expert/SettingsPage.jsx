import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'

const SettingsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="settings" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Settings"
          subtitle="Manage your profile settings, notification preferences, and account security."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="admin-panel-card">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>Cài đặt tài khoản, thông báo và bảo mật thông tin cá nhân.</p>
          </div>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default SettingsPage
