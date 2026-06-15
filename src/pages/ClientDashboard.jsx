import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Sidebar from "../Components/Dashboard/Sidebar"
import DashboardHeader from "../Components/Dashboard/DashboardHeader"
import StatCard from "../Components/Dashboard/StatCard"
import SpendingChart from "../Components/Dashboard/SpendingChart"
import ActiveProjectsTable from "../Components/Dashboard/ActiveProjectsTable"
import RecentActivity from "../Components/Dashboard/RecentActivity"
import TalentCard from "../Components/Dashboard/TalentCard"
import { getStoredUser } from "../Services/checkLogin"
import "../Components/Dashboard/Dashboard.css"

function ClientDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const user = getStoredUser();
    const role = user?.role || "client";
    if (role !== "client" && role !== "admin") {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [navigate]);

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
          <button className="secondary-btn">Download Report</button>
          <button className="primary-small-btn" onClick={() => navigate("/post-job")}>New Project</button>
        </div>

        <section className="stats-grid">
          <StatCard
            icon="💵"
            title="Total Spent"
            value="$24,500.00"
            badge="+12.5%"
            badgeType="success"
          />

          <StatCard
            icon="☑️"
            title="Active Projects"
            value="8"
            subtitle="/ 12 Total"
            badge="Active"
          />

          <StatCard
            icon="📩"
            title="Pending Proposals"
            value="3"
            badge="Action Needed"
            badgeType="danger"
          />
        </section>

        <section className="dashboard-content">
          <div className="dashboard-left-content">
            <SpendingChart />
            <ActiveProjectsTable />
          </div>

          <div className="dashboard-right-content">
            <RecentActivity />
            <TalentCard />
          </div>
        </section>
      </main>
    </div>
  )
}

export default ClientDashboard