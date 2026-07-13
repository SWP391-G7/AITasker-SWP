import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import ContentModerationView from '../../../Components/Dashboard/Admin/ContentModeration/ContentModerationView'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import Footer from '../../../Components/Footer/Footer'
import {
  buildModerationQueueItems,
  getAdminDashboardData,
  updateContentStatus
} from '../../../Services/adminDashboardService'
import '../Style/AdminDashboardPage.css'
import '../Style/ContentModerationPage.css'

const ContentModerationPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [moderationItems, setModerationItems] = useState([])
  const [moderationError, setModerationError] = useState('')

  useEffect(() => {
    const fetchModerationData = async () => {
      try {
        setModerationError('')

        // Fetch ALL content for moderation queue (not just pending)
        const data = await getAdminDashboardData('all')
        setModerationItems(buildModerationQueueItems(data.jobs, data.services))
      } catch (err) {
        setModerationError(err.message || 'Failed to load moderation data.')
        setModerationItems([])
      }
    }

    fetchModerationData()
  }, [])

  const moderationStats = useMemo(() => {
    const high = moderationItems.filter((item) => item.severityLabel === 'High').length
    const services = moderationItems.filter((item) => item.category === 'Service').length
    const jobs = moderationItems.filter((item) => item.category === 'Job').length

    return [
      { label: 'Total Queue', value: moderationItems.length, note: 'Jobs and services from API' },
      { label: 'High Priority', value: high, note: 'Missing critical details', tone: 'is-danger' },
      { label: 'Services', value: services, note: 'Service listings' },
      { label: 'Jobs', value: jobs, note: 'Client job posts', tone: 'is-success' },
    ]
  }, [moderationItems])

  const handleApprove = async (id) => {
    try {
      const parts = id.split('-');
      const type = parts[0];
      const itemId = parts.slice(1).join('-');
      await updateContentStatus(type, itemId, 'approved');
      // Update the status state inline so it remains visible
      setModerationItems((prev) => 
        prev.map((item) => item.id === id ? { ...item, status: 'approved' } : item)
      );
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to approve content');
    }
  }

  const handleReject = async (id) => {
    try {
      const parts = id.split('-');
      const type = parts[0];
      const itemId = parts.slice(1).join('-');
      // Update status to 'removed'
      await updateContentStatus(type, itemId, 'removed');
      // Update the status state inline so it remains visible
      setModerationItems((prev) => 
        prev.map((item) => item.id === id ? { ...item, status: 'removed' } : item)
      );
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to reject content');
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
        activeTab="moderation"
        onTabChange={(tabId) => handleAdminTabChange(tabId, navigate)}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel content-moderation-main">
        <AdminHeader
          title="Content Moderation"
          subtitle="Review flagged listings, services, and marketplace activity."
          headerActions={
            <button type="button" className="btn-approve admin-header-action-button">
              <ShieldCheck size={16} />
              Review Queue
            </button>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search flagged content..."
          onLogout={handleLogout}
        />
        {moderationError && <div className="alert alert-danger">{moderationError}</div>}
        <ContentModerationView
          searchQuery={searchQuery}
          items={moderationItems}
          stats={moderationStats}
          onApprove={handleApprove}
          onReject={handleReject}
        />
        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default ContentModerationPage

