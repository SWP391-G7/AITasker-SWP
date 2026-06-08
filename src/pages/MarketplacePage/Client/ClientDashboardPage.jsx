import ClientContentGrid from "../../../Components/Dashboard/Client/ClientContentGrid"
import ClientStats from "../../../Components/Dashboard/Client/ClientStats"
import DashboardActions from "../../../Components/Dashboard/Client/DashboardActions"
import DashboardHeader from "../../../Components/Dashboard/Client/DashboardHeader"
import DashboardLayout from "../../../Components/Dashboard/Client/DashboardLayout"
import "../../../Components/Dashboard/Client/Dashboard.css"

function ClientDashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardActions />
      <ClientStats />
      <ClientContentGrid />
    </DashboardLayout>
  )
}

export default ClientDashboard
