import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Download } from 'lucide-react'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import AnalyticsView from '../../../Components/Dashboard/Admin/Analytics/AnalyticsView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import {
  buildLiveAnalytics,
  getAdminAnalytics
} from '../../../Services/adminDashboardService'
import '../Style/AdminDashboardPage.css'
import '../Style/AnalyticsPage.css'

const currentYear = new Date().getFullYear()
const earliestAnalyticsYear = 2020

const AnalyticsPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [analyticsData, setAnalyticsData] = useState({
    kpis: [],
    revenueBars: [],
    engagementMetrics: [],
    topExperts: [],
    period: {},
    definitions: {},
  })
  const [analyticsError, setAnalyticsError] = useState('')

  useEffect(() => {
    const numericYear = Number(selectedYear)
    if (
      selectedYear.length !== 4
      || !Number.isInteger(numericYear)
      || numericYear < earliestAnalyticsYear
      || numericYear > currentYear
    ) {
      return undefined
    }

    let ignoreResult = false

    const fetchAnalytics = async () => {
      try {
        setAnalyticsError('')

        // The backend aggregates live platform data so the browser never downloads full financial tables.
        const data = await getAdminAnalytics({
          from: `${numericYear}-01-01`,
          to: `${numericYear}-12-31`,
        })
        if (!ignoreResult) {
          setAnalyticsData(buildLiveAnalytics(data))
        }
      } catch (err) {
        if (ignoreResult) return
        setAnalyticsError(err.message || 'Failed to load analytics data.')
        setAnalyticsData({
          kpis: [],
          revenueBars: [],
          engagementMetrics: [],
          topExperts: [],
          period: {},
          definitions: {},
        })
      }
    }

    fetchAnalytics()
    return () => {
      ignoreResult = true
    }
  }, [selectedYear])

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value.replace(/\D/g, '').slice(0, 4))
  }

  const normalizeSelectedYear = () => {
    const numericYear = Number(selectedYear)
    if (!Number.isInteger(numericYear) || numericYear < earliestAnalyticsYear || numericYear > currentYear) {
      setSelectedYear(String(currentYear))
    }
  }

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
              <label className="btn-case admin-header-action-button analytics-year-control">
                <CalendarDays size={16} />
                <span>Year</span>
                <input
                  type="number"
                  min={earliestAnalyticsYear}
                  max={currentYear}
                  step="1"
                  inputMode="numeric"
                  aria-label="Analytics year"
                  value={selectedYear}
                  onChange={handleYearChange}
                  onBlur={normalizeSelectedYear}
                />
              </label>
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
        <AnalyticsView
          kpis={analyticsData.kpis}
          revenueBars={analyticsData.revenueBars}
          engagementMetrics={analyticsData.engagementMetrics}
          experts={analyticsData.topExperts}
          period={analyticsData.period}
          definitions={analyticsData.definitions}
        />
        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default AnalyticsPage

