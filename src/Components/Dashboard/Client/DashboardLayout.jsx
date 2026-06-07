import Sidebar from "./Sidebar"

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-page client-dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
