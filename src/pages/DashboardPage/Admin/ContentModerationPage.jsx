import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import ContentModerationView from '../../../Components/Dashboard/Admin/ContentModeration/ContentModerationView'
import AdminModerationConfirmModal from '../../../Components/Dashboard/Admin/AdminModerationConfirmModal'
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
  const [moderationConfirm, setModerationConfirm] = useState(null)
  const [moderationActionLoading, setModerationActionLoading] = useState(false)

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

  const requestModerationAction = (action, id) => {
    const item = moderationItems.find((entry) => entry.id === id)
    setModerationError('')
    setModerationConfirm({ action, id, title: item?.title || 'Untitled content' })
  }

  const handleConfirmModeration = async () => {
    if (!moderationConfirm) return

    try {
      setModerationActionLoading(true)
      setModerationError('')
      const { action, id } = moderationConfirm
      const parts = id.split('-')
      const type = parts[0]
      const itemId = parts.slice(1).join('-')
      const nextStatus = action === 'approve' ? 'approved' : 'removed'

      await updateContentStatus(type, itemId, nextStatus)
      setModerationItems((prev) =>
        prev.map((item) => item.id === id ? { ...item, status: nextStatus } : item)
      )
      setModerationConfirm(null)
    } catch (err) {
      console.error(err)
      setModerationError(err.message || 'Failed to update content')
      setModerationConfirm(null)
    } finally {
      setModerationActionLoading(false)
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
          onApprove={(id) => requestModerationAction('approve', id)}
          onReject={(id) => requestModerationAction('reject', id)}
          onUnpublish={(id) => requestModerationAction('unpublish', id)}
        />
        <Footer variant="dashboard" />
      </main>
      <AdminModerationConfirmModal
        action={moderationConfirm?.action}
        contentTitle={moderationConfirm?.title}
        loading={moderationActionLoading}
        onCancel={() => setModerationConfirm(null)}
        onConfirm={handleConfirmModeration}
      />
    </div>
  )
}

export default ContentModerationPage

