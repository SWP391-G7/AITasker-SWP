import Sidebar from "../Components/dashboard/Sidebar"
import DashboardHeader from "../Components/dashboard/DashboardHeader"
import StatCard from "../Components/dashboard/StatCard"
import SpendingChart from "../Components/dashboard/SpendingChart"
import ActiveProjectsTable from "../Components/dashboard/ActiveProjectsTable"
import RecentActivity from "../Components/dashboard/RecentActivity"
import TalentCard from "../Components/dashboard/TalentCard"
import "../Components/dashboard/Dashboard.css"

function ClientDashboard() {
  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <DashboardHeader />

        <div className="dashboard-actions">
          <button className="secondary-btn">Download Report</button>
          <button className="primary-small-btn">New Project</button>
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