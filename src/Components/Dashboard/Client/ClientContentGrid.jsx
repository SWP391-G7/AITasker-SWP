import ActiveProjectsTable from "./ActiveProjectsTable"
import RecentActivity from "./RecentActivity"
import SpendingChart from "./SpendingChart"
import TalentCard from "./TalentCard"

function ClientContentGrid() {
  return (
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
  )
}

export default ClientContentGrid
