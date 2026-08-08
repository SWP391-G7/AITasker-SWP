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
import WithdrawalModal from '../../../Components/Dashboard/Expert/Earnings/WithdrawalModal'
import { getMyTransactionsAPI } from '../../../Services/transactionService'
import { downloadExpertEarningsPdf } from '../../../Services/pdfExportService'
import { createHandleLogout } from './handleLogout'
import '../Style/AdminDashboardPage.css'
import '../Style/ExpertDashboardPage.css'
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
  const [monthlyChartData, setMonthlyChartData] = useState([])
  const [transactions, setTransactions] = useState([])
  const [earningsError, setEarningsError] = useState('')
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [availableNumeric, setAvailableNumeric] = useState(0)
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

  const fetchEarningsData = async () => {
    try {
      setEarningsError('')

      const result = await getMyTransactionsAPI()
      if (result && result.success) {
        const stats = result.stats || { totalLifetime: 0, availableNow: 0, pendingClearance: 0, inEscrow: 0 }
        const txList = Array.isArray(result.transactions) ? result.transactions : []

        const totalLifetime = stats.totalLifetime
        const availableNow = stats.availableNow
        const inEscrow = stats.inEscrow
        setAvailableNumeric(availableNow)

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
            label: 'In Escrow (Secured)',
            value: formatCurrency(inEscrow),
            trend: 'ESCROW SECURED',
            trendType: 'up',
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
          nextPayout: availableNow > 0 ? 'Ready for Withdrawal' : 'No funds ready',
        })

        // Compute dynamic last 6 months chart data
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const now = new Date();
        const last6 = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          last6.push({
            year: d.getFullYear(),
            monthIdx: d.getMonth(),
            month: monthNames[d.getMonth()],
            amount: 0
          });
        }

        txList.forEach(tx => {
          if (tx.status === 'completed' && tx.complete_at) {
            const txDate = new Date(tx.complete_at);
            const found = last6.find(m => m.year === txDate.getFullYear() && m.monthIdx === txDate.getMonth());
            if (found) {
              found.amount += parseFloat(tx.amount || 0);
            }
          }
        });
        setMonthlyChartData(last6.map(m => ({ month: m.month, amount: m.amount })));

        setTransactions(
          txList.map((tx) => ({
            id: `#tx-${tx.id.slice(0, 8)}`,
            escrowTxId: tx.escrow_tx_id,
            project: tx.project_title || 'Payment Release',
            date: tx.complete_at ? new Date(tx.complete_at).toLocaleDateString() : 'Completed',
            status: tx.status ? tx.status.toUpperCase() : 'COMPLETED',
            statusType: tx.status === 'completed' ? 'success' : 'pending',
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

  useEffect(() => {
    fetchEarningsData()
  }, [])

  const handleExportPdf = () => {
    downloadExpertEarningsPdf({
      user,
      transactions,
      incomeSummary,
    })
  }

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="earnings" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Earnings"
          subtitle="Monitor your revenue and manage your payouts."
          headerActions={
            <div className="header-actions">
              <button className="btn-export" type="button" onClick={handleExportPdf} style={{ cursor: 'pointer' }}>
                Export Statement
              </button>
              <button className="btn-withdraw" type="button" onClick={() => setIsWithdrawModalOpen(true)} style={{ cursor: 'pointer' }}>
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
          
          <EarningsCharts summary={incomeSummary} monthlyChartData={monthlyChartData} />
          
          <TransactionTable transactions={transactions} />
        </div>

        <WithdrawalModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          availableBalance={formatCurrency(availableNumeric)}
          availableNumeric={availableNumeric}
          onSuccess={fetchEarningsData}
        />

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default EarningsPage
