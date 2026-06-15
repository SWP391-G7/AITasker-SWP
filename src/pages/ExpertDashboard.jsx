import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Sidebar from "../Components/Dashboard/Sidebar"
import DashboardHeader from "../Components/Dashboard/DashboardHeader"
import StatCard from "../Components/Dashboard/StatCard"
import SpendingChart from "../Components/Dashboard/SpendingChart"
import RecentActivity from "../Components/Dashboard/RecentActivity"
import "../Components/Dashboard/Dashboard.css"

function ExpertDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (location.state && location.state.message) {
      setAlert(location.state)
      // Clear history state to avoid alert showing up on manual reloads
      window.history.replaceState({}, document.title)
      const timer = setTimeout(() => {
        setAlert(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <DashboardHeader />

        {alert && (
          <div className={`dashboard-alert alert-${alert.type}`}>
            <span className="alert-icon">{alert.type === "success" ? "✅" : "❌"}</span>
            <p className="alert-message">{alert.message}</p>
            <button className="close-alert-btn" onClick={() => setAlert(null)}>×</button>
          </div>
        )}

        <div className="dashboard-actions">
          <button className="secondary-btn">Download Earnings Report</button>
          <button className="primary-small-btn" onClick={() => navigate("/post-service")}>Post a Service</button>
        </div>

        <section className="stats-grid">
          <StatCard
            icon="💵"
            title="Total Earnings"
            value="$18,250.00"
            badge="+8.4%"
            badgeType="success"
          />

          <StatCard
            icon="☑️"
            title="Completed Services"
            value="14"
            subtitle="/ 16 Total"
            badge="Active"
          />

          <StatCard
            icon="📩"
            title="Pending Invitations"
            value="2"
            badge="Action Needed"
            badgeType="danger"
          />
        </section>

        <section className="dashboard-content">
          <div className="dashboard-left-content">
            <SpendingChart />
          </div>

          <div className="dashboard-right-content">
            <RecentActivity />
          </div>
        </section>
      </main>
    </div>
  )
}

export default ExpertDashboard
