import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Download } from 'lucide-react'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import AnalyticsView from '../../../Components/Dashboard/Admin/Analytics/AnalyticsView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import {
  buildAnalytics,
  getAdminDashboardData
} from '../../../Services/adminDashboardService'
import '../../Style/AdminDashboardPage.css'
import '../../Style/AnalyticsPage.css'

const AnalyticsPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [analyticsData, setAnalyticsData] = useState({ kpis: [], topExperts: [] })
  const [analyticsError, setAnalyticsError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsError('')

        // API data: analytics derives live KPIs from existing search endpoints.
        const data = await getAdminDashboardData()
        setAnalyticsData(buildAnalytics(data))
      } catch (err) {
        setAnalyticsError(err.message || 'Failed to load analytics data.')
        setAnalyticsData({ kpis: [], topExperts: [] })
      }
    }

    fetchAnalytics()
  }, [])

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
        <AdminHeader
          title="Platform Analytics"
          subtitle="Real-time performance metrics for AITasker."
          headerActions={
            <div className="header-actions admin-header-action-group">
              <button className="btn-case admin-header-action-button" type="button">
                <CalendarDays size={16} />
                Oct 01 - Oct 31, 2024
              </button>
              <button className="btn-approve admin-header-action-button" type="button">
                <Download size={16} />
                Export
              </button>
            </div>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search analytics..."
          onLogout={handleLogout}
        />
        {analyticsError && <div className="alert alert-danger">{analyticsError}</div>}
        <AnalyticsView kpis={analyticsData.kpis} experts={analyticsData.topExperts} />
        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default AnalyticsPage
