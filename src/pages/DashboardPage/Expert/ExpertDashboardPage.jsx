/**
 * Frontend module: pages/DashboardPage/Expert/ExpertDashboardPage.jsx
 *
 * Vai trò: Page Expert Dashboard Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ContractsPanel from '../../../Components/Dashboard/Expert/ContractsPanel'
import Footer from '../../../Components/Footer/Footer'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertRatingPanel from '../../../Components/Dashboard/Expert/ExpertRatingPanel'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import FinancialPerformancePanel from '../../../Components/Dashboard/Expert/FinancialPerformancePanel'
import InvitationsPanel from '../../../Components/Dashboard/Expert/InvitationsPanel'
import TechnicalStackCard from '../../../Components/Dashboard/Expert/TechnicalStackCard'
import { getUserProfile } from '../../../Services/profileService'
import { getMyProjects } from '../../../Services/projectService'
import { getMyInvitations, updateInvitationStatus } from '../../../Services/invitationService'
import { getMyTransactionsAPI } from '../../../Services/transactionService'
import '../Style/AdminDashboardPage.css'
import '../Style/ExpertDashboardPage.css'

// React component “Expert Dashboard Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ExpertDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)
  const [contracts, setContracts] = useState([])
  const [invitations, setInvitations] = useState([])
  const [skills, setSkills] = useState([])
  const [rating, setRating] = useState(5)
  const [dashboardError, setDashboardError] = useState('')
  const [financialStats, setFinancialStats] = useState({
    totalLifetime: '$0.00',
    availableNow: '$0.00',
    pendingClearance: '$0.00',
    inEscrow: '$0.00',
  })

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = onLogout || (() => {
    logout()
    navigate('/')
  })

  // Handler “handle tab change” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleTabChange = (id) => {
    setActiveTab(id)
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  // Chuyển đổi dữ liệu cho “format currency” thành định dạng mà lớp gọi hoặc giao diện cần.
  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value) || 0)

  // Thực hiện phần logic “split csv” trong phạm vi trách nhiệm của module hiện tại.
  const splitCsv = (value) =>
    value
      ? String(value).split(',').map((item) => item.trim()).filter(Boolean)
      : []

  // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch expert dashboard data”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
  const fetchExpertDashboardData = async () => {
    try {
      setDashboardError('')

      // API data: load profile, projects, invitations, and transaction stats in parallel
      const [profileResult, projectsResult, invitationsResult, transactionsResult] = await Promise.all([
        user?.id ? getUserProfile(user.id) : Promise.resolve(null),
        getMyProjects(),
        getMyInvitations(),
        getMyTransactionsAPI().catch(() => ({ success: false, stats: null }))
      ])

      setSkills(splitCsv(profileResult?.expertProfile?.skills))
      setRating(profileResult?.expertProfile?.avgRating || 5)

      // 1. Map financial stats from transaction API
      if (transactionsResult && transactionsResult.success && transactionsResult.stats) {
        const stats = transactionsResult.stats;
        setFinancialStats({
          totalLifetime: formatCurrency(stats.totalLifetime),
          availableNow: formatCurrency(stats.availableNow),
          pendingClearance: formatCurrency(stats.pendingClearance),
          inEscrow: formatCurrency(stats.inEscrow)
        });
      } else {
        setFinancialStats({
          totalLifetime: '$0.00',
          availableNow: '$0.00',
          pendingClearance: '$0.00',
          inEscrow: '$0.00'
        });
      }

      // 2. Map projects to contracts panel
      const apiProjects = Array.isArray(projectsResult) ? projectsResult : [];
      setContracts(
        apiProjects.map((proj) => ({
          id: proj.id,
          name: proj.title || 'Untitled Project',
          client: proj.client_name || 'Client',
          price: formatCurrency(proj.total_amount),
          pricingType: proj.type || 'fixed',
          progress: proj.status || 'ACTIVE',
          status: String(proj.status).toUpperCase(),
          tagClass: proj.status === 'completed' ? 'tag-completed' : 'tag-review',
        }))
      )

      // 3. Map invitations
      const apiInvitations = Array.isArray(invitationsResult) ? invitationsResult : [];
      setInvitations(
        apiInvitations.slice(0, 5).map((inv) => ({
          id: inv.id,
          role: inv.service_title || 'Untitled Service Request',
          budget: formatCurrency(inv.bid_amount || inv.service_price),
          duration: inv.delivery_days ? `${inv.delivery_days} days` : (inv.service_delivery_days ? `${inv.service_delivery_days} days` : 'Flexible'),
          client: inv.client_name || 'Client',
          status: inv.status || 'pending',
        }))
      )
    } catch (err) {
      setDashboardError(err.message || 'Failed to load expert dashboard data.')
      setContracts([])
      setInvitations([])
    }
  }

  useEffect(() => {
    fetchExpertDashboardData()
  }, [user?.id])

  // Handler “handle accept invitation” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleAcceptInvitation = async (invitationId) => {
    try {
      await updateInvitationStatus({ invitationId, status: 'accepted', start_project: true })
      await fetchExpertDashboardData()
    } catch (err) {
      setDashboardError(err.message || 'Failed to accept service request.')
    }
  }

  // Handler “handle decline invitation” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleDeclineInvitation = async (invitationId) => {
    try {
      await updateInvitationStatus({ invitationId, status: 'rejected' })
      await fetchExpertDashboardData()
    } catch (err) {
      setDashboardError(err.message || 'Failed to decline service request.')
    }
  }

  const filteredContracts = contracts.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInvitations = invitations.filter((item) =>
    item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.budget.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.duration.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Expert Overview"
          subtitle={<>Your performance is up <span className="trend-up">+12.4%</span> this month.</>}
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="expert-overview-grid">
          {dashboardError && <div className="alert alert-danger">{dashboardError}</div>}
          <FinancialPerformancePanel {...financialStats} />
          <div className="expert-overview-side">
            <ExpertRatingPanel rating={rating} projectCount={contracts.length} />
            <TechnicalStackCard skills={skills} />
          </div>
        </section>

        <section className="expert-work-grid">
          <ContractsPanel contracts={filteredContracts} />
          <InvitationsPanel invitations={filteredInvitations} onAccept={handleAcceptInvitation} onDecline={handleDeclineInvitation} />
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default ExpertDashboardPage

