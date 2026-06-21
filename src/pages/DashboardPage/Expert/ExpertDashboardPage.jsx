import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ContractsPanel from '../../../Components/Dashboard/Expert/ContractsPanel'
import Footer from '../../../Components/Footer/Footer'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertRatingPanel from '../../../Components/Dashboard/Expert/ExpertRatingPanel'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import FinancialPerformancePanel from '../../../Components/Dashboard/Expert/FinancialPerformancePanel'
import InvitationsPanel from '../../../Components/Dashboard/Expert/InvitationsPanel'
import TechnicalStackCard from '../../../Components/Dashboard/Expert/TechnicalStackCard'
import { contracts, invitations, skills } from '../../../Components/Dashboard/Expert/expertDashboardData'
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'

const ExpertDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
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

  const handleLogout = onLogout || createHandleLogout(navigate)

  const handleTabChange = (id) => {
    setActiveTab(id)
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
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
          <FinancialPerformancePanel />
          <div className="expert-overview-side">
            <ExpertRatingPanel />
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
