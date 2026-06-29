import { useEffect, useMemo, useState, useCallback } from 'react'
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
import { getMarketplaceJobs, getMyServices } from '../../../Services/serviceService'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'

const ExpertDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [contracts, setContracts] = useState([])
  const [invitations, setInvitations] = useState([])
  const [skills, setSkills] = useState([])
  const [rating, setRating] = useState(0)
  const [dashboardError, setDashboardError] = useState('')
  const [financialStats, setFinancialStats] = useState({
    totalValue: '$0.00',
    serviceCount: 0,
    avgPrice: '$0.00',
    priceRange: '$0 — $0',
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

  const handleTabChange = (id) => {
    setActiveTab(id)
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value) || 0)

  const splitCsv = (value) =>
    value
      ? String(value).split(',').map((item) => item.trim()).filter(Boolean)
      : []

  const buildMonthlyEarnings = useCallback((apiServices) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyTotals = Array(12).fill(0)
    apiServices.forEach((s) => {
      if (s.created_at || s.createdAt) {
        const d = new Date(s.created_at || s.createdAt)
        monthlyTotals[d.getMonth()] += Number(s.price) || 0
      }
    })
    const maxVal = Math.max(...monthlyTotals, 1)
    return monthNames.map((label, i) => ({
      label,
      height: `${Math.max(2, (monthlyTotals[i] / maxVal) * 100)}%`,
      highlighted: i === new Date().getMonth(),
    }))
  }, [])

  useEffect(() => {
    const fetchExpertDashboardData = async () => {
      try {
        setDashboardError('')

        const [profileResult, services, jobs] = await Promise.all([
          user?.id ? getUserProfile(user.id) : Promise.resolve(null),
          getMyServices(),
          getMarketplaceJobs(),
        ])

        const apiServices = Array.isArray(services) ? services : []
        const prices = apiServices.map((s) => Number(s.price) || 0)
        const serviceTotal = prices.reduce((sum, p) => sum + p, 0)
        const minPrice = prices.length ? Math.min(...prices) : 0
        const maxPrice = prices.length ? Math.max(...prices) : 0

        setSkills(splitCsv(profileResult?.expertProfile?.skills))
        setRating(profileResult?.expertProfile?.avgRating || 0)

        setFinancialStats({
          totalValue: formatCurrency(serviceTotal),
          serviceCount: apiServices.length,
          avgPrice: formatCurrency(apiServices.length ? serviceTotal / apiServices.length : 0),
          priceRange: `${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`,
          earningsBars: buildMonthlyEarnings(apiServices),
        })

        setContracts(
          apiServices.map((service) => ({
            id: service.id,
            name: service.title || 'Untitled Service',
            price: formatCurrency(service.price),
            pricingType: service.pricing_type || service.pricingType || 'fixed',
            progress: `${service.delivery_days || service.deliveryDays || 0} days delivery`,
            status: 'PUBLISHED',
          }))
        )

        setInvitations(
          (Array.isArray(jobs) ? jobs : []).slice(0, 5).map((job) => ({
            id: job.id,
            role: job.title || 'Untitled Client Task',
            budget: formatCurrency(job.budget_max ?? job.budgetMax ?? job.budget_min ?? job.budgetMin ?? 0),
            duration: job.duration_days ? `${job.duration_days} days` : 'Flexible',
          }))
        )
      } catch (err) {
        setDashboardError(err.message || 'Failed to load expert dashboard data.')
        setContracts([])
        setInvitations([])
      }
    }

    fetchExpertDashboardData()
  }, [user?.id, buildMonthlyEarnings])

  const filteredContracts = contracts.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.price && item.price.toLowerCase().includes(searchQuery.toLowerCase()))
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
          subtitle="Overview of your services and marketplace opportunities."
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
          <InvitationsPanel invitations={filteredInvitations} />
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default ExpertDashboardPage
