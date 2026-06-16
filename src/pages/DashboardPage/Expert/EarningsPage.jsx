import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import EarningsOverviewCards from '../../../Components/Dashboard/Expert/Earnings/EarningsOverviewCards'
import EarningsCharts from '../../../Components/Dashboard/Expert/Earnings/EarningsCharts'
import TransactionTable from '../../../Components/Dashboard/Expert/Earnings/TransactionTable'
import { earningsStats, incomeSummary, transactions } from '../../../Components/Dashboard/Expert/Earnings/earningsData'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/Earnings/EarningsPage.css'

const EarningsPage = () => {
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
      <ExpertSidebar activeTab="earnings" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Earnings"
          subtitle="Monitor your revenue and manage your payouts."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="earnings-container">
          <div className="page-title-section justify-content-end">
            <div className="header-actions">
              <button className="btn-export">Export Statement</button>
              <button className="btn-withdraw">
                <Wallet size={18} />
                Withdraw Funds
              </button>
            </div>
          </div>

          <EarningsOverviewCards stats={earningsStats} />
          
          <EarningsCharts summary={incomeSummary} />
          
          <TransactionTable transactions={transactions} />
        </div>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default EarningsPage
