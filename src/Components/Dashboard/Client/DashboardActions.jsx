import { FileDown, Plus } from "lucide-react"

function DashboardActions() {
  return (
    <div className="dashboard-actions">
      <button className="secondary-btn">
        <FileDown size={16} />
        Download Report
      </button>
      <button className="primary-small-btn">
        <Plus size={16} />
        New Project
      </button>
    </div>
  )
}

export default DashboardActions
