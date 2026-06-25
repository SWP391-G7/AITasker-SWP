import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import EarningsOverviewCards from '../../../Components/Dashboard/Expert/Earnings/EarningsOverviewCards'
import EarningsCharts from '../../../Components/Dashboard/Expert/Earnings/EarningsCharts'
import TransactionTable from '../../../Components/Dashboard/Expert/Earnings/TransactionTable'
import { getMyServices } from '../../../Services/serviceService'
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/Earnings/EarningsPage.css'

const EarningsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)
  const [earningsStats, setEarningsStats] = useState([])
  const [incomeSummary, setIncomeSummary] = useState({
    gross: '$0.00',
    fees: '-$0.00',
    net: '$0.00',
    nextPayout: 'Not scheduled',
  })
  const [transactions, setTransactions] = useState([])
  const [earningsError, setEarningsError] = useState('')
  const handleLogout = createHandleLogout(navigate)

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value) || 0)

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setEarningsError('')

        // API data: derive earnings from the current expert's services via GET /api/services/my.
        const services = await getMyServices()
        const apiServices = Array.isArray(services) ? services : []
        const gross = apiServices.reduce((sum, service) => sum + (Number(service.price) || 0), 0)
        const fees = gross * 0.1
        const net = gross - fees

        setEarningsStats([
          {
            id: 'stat-api-1',
            label: 'Available for Withdrawal',
            value: formatCurrency(net),
            trend: `${apiServices.length} SERVICES`,
            trendType: 'neutral',
            icon: 'bank',
          },
          {
            id: 'stat-api-2',
            label: 'Pending in Escrow',
            value: formatCurrency(fees),
            trend: '10% SERVICE FEE',
            trendType: 'neutral',
            icon: 'lock',
          },
          {
            id: 'stat-api-3',
            label: 'Avg. Service Revenue',
            value: formatCurrency(apiServices.length ? gross / apiServices.length : 0),
            trend: null,
            trendType: 'up',
            icon: 'chart',
          },
        ])

        setIncomeSummary({
          gross: formatCurrency(gross),
          fees: `-${formatCurrency(fees)}`,
          net: formatCurrency(net),
          nextPayout: 'Not scheduled',
        })

        setTransactions(
          apiServices.map((service) => ({
            id: `#svc-${service.id}`,
            project: service.title || 'Untitled Service',
            date: service.created_at ? new Date(service.created_at).toLocaleDateString() : 'From API',
            status: 'PUBLISHED',
            statusType: 'active',
            amount: `+${formatCurrency(service.price)}`,
            iconType: 'database',
          }))
        )
      } catch (err) {
        setEarningsError(err.message || 'Failed to load earnings data.')
        setEarningsStats([])
        setTransactions([])
      }
    }

    fetchEarningsData()
  }, [])

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="earnings" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Earnings"
          subtitle="Monitor your revenue and manage your payouts."
          headerActions={
            <div className="header-actions">
              <button className="btn-export">Export Statement</button>
              <button className="btn-withdraw">
                <Wallet size={18} />
                Withdraw Funds
              </button>
            </div>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="earnings-container">
          {earningsError && <div className="alert alert-danger">{earningsError}</div>}

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
