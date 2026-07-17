import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminContentGrid from '../../../Components/Dashboard/Admin/AdminContentGrid'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import AdminStats from '../../../Components/Dashboard/Admin/AdminStats'
import DisputeDetailModal from '../../../Components/Dashboard/Admin/DisputeDetailModal'
import UserGrowthChart from '../../../Components/Dashboard/Admin/UserGrowthChart'
import Footer from '../../../Components/Footer/Footer'
import { initialDisputes } from '../../../Components/Dashboard/Admin/adminDashboardData'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import {
  buildAdminModerationItems,
  getAdminDashboardData,
  updateContentStatus
} from '../../../Services/adminDashboardService'
import '../Style/AdminDashboardPage.css'

const AdminDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [moderations, setModerations] = useState([])
  const [disputes, setDisputes] = useState(initialDisputes)
  const [notifications, setNotifications] = useState(3)
  const [userCount, setUserCount] = useState(0)
  const [users, setUsers] = useState([])
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setDashboardError('')

        // API data: admin dashboard uses existing search endpoints for users, jobs, and services.
        const data = await getAdminDashboardData()
        setUsers(data.users)
        setUserCount(data.users.length)
        setModerations(buildAdminModerationItems(data.jobs, data.services))
      } catch (err) {
        setDashboardError(err.message || 'Failed to load admin dashboard data.')
        setModerations([])
        setUsers([])
        setUserCount(0)
      }
    }

    fetchAdminDashboard()
  }, [])

  const handleLogout = onLogout || (() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/')
  })

  const handleResolveDispute = (id) => {
    setDisputes((prev) => prev.filter((item) => item.id !== id))
    setSelectedDispute(null)
  }

  const handleApproveModeration = async (id) => {
    try {
      const parts = id.split('-');
      const type = parts[0];
      const itemId = parts.slice(1).join('-');
      await updateContentStatus(type, itemId, 'approved');
      setModerations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to approve content');
    }
  }

  const handleRejectModeration = async (id) => {
    try {
      const parts = id.split('-');
      const type = parts[0];
      const itemId = parts.slice(1).join('-');
      await updateContentStatus(type, itemId, 'removed');
      setModerations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to reject content');
    }
  }

  const filteredDisputes = disputes.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.expert.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tabId) => handleAdminTabChange(tabId, navigate, setActiveTab)}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel">
        <AdminHeader
          title="Admin Command Center"
          subtitle="System oversight and marketplace operations."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={handleLogout}
        />
        {dashboardError && <div className="alert alert-danger">{dashboardError}</div>}
        <AdminStats userCount={userCount} moderationCount={moderations.length} disputeCount={disputes.length} />
        <AdminContentGrid
          disputes={filteredDisputes}
          moderations={moderations}
          onApproveModeration={handleApproveModeration}
          onRejectModeration={handleRejectModeration}
          onSelectDispute={setSelectedDispute}
        />
        <UserGrowthChart users={users} />
        <Footer variant="dashboard" />
      </main>

      <DisputeDetailModal
        dispute={selectedDispute}
        onClose={() => setSelectedDispute(null)}
        onResolve={handleResolveDispute}
      />
    </div>
  )
}

export default AdminDashboardPage

