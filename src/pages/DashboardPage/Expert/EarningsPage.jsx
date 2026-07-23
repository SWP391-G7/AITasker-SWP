/**
 * Frontend module: pages/DashboardPage/Expert/EarningsPage.jsx
 *
 * Vai trò: Page Earnings Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import EarningsOverviewCards from '../../../Components/Dashboard/Expert/Earnings/EarningsOverviewCards'
import EarningsCharts from '../../../Components/Dashboard/Expert/Earnings/EarningsCharts'
import TransactionTable from '../../../Components/Dashboard/Expert/Earnings/TransactionTable'
import { getMyTransactionsAPI } from '../../../Services/transactionService'
import { createHandleLogout } from './handleLogout'
import '../Style/AdminDashboardPage.css'
import '../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/Earnings/EarningsPage.css'

// React component “Earnings Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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

  // Handler “handle tab change” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  // Chuyển đổi dữ liệu cho “format currency” thành định dạng mà lớp gọi hoặc giao diện cần.
  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value) || 0)

  useEffect(() => {
    // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch earnings data”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
    const fetchEarningsData = async () => {
      try {
        setEarningsError('')

        const result = await getMyTransactionsAPI()
        if (result && result.success) {
          const stats = result.stats || { totalLifetime: 0, availableNow: 0, pendingClearance: 0, inEscrow: 0 }
          const txList = Array.isArray(result.transactions) ? result.transactions : []

          const totalLifetime = stats.totalLifetime
          const availableNow = stats.availableNow
          const pendingClearance = stats.pendingClearance
          const inEscrow = stats.inEscrow

          setEarningsStats([
            {
              id: 'stat-api-1',
              label: 'Available for Withdrawal',
              value: formatCurrency(availableNow),
              trend: 'WALLET READY',
              trendType: 'neutral',
              icon: 'bank',
            },
            {
              id: 'stat-api-2',
              label: 'Pending Clearance',
              value: formatCurrency(pendingClearance),
              trend: 'IN PROCESS',
              trendType: 'neutral',
              icon: 'lock',
            },
            {
              id: 'stat-api-3',
              label: 'Total Lifetime Earnings',
              value: formatCurrency(totalLifetime),
              trend: `${txList.length} TRANSACTIONS`,
              trendType: 'up',
              icon: 'chart',
            },
          ])

          // Calculate gross, fees (10%), net
          const gross = totalLifetime
          const fees = gross * 0.1
          const net = gross - fees

          setIncomeSummary({
            gross: formatCurrency(gross),
            fees: `-${formatCurrency(fees)}`,
            net: formatCurrency(net),
            nextPayout: 'Not scheduled',
          })

          setTransactions(
            txList.map((tx) => ({
              id: `#tx-${tx.id.slice(0, 8)}`,
              project: tx.project_title || 'Payment Release',
              date: tx.complete_at ? new Date(tx.complete_at).toLocaleDateString() : 'Completed',
              status: tx.status ? tx.status.toUpperCase() : 'COMPLETED',
              statusType: tx.status === 'completed' ? 'active' : 'pending',
              amount: `+${formatCurrency(tx.amount)}`,
              iconType: 'wallet',
            }))
          )
        }
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

