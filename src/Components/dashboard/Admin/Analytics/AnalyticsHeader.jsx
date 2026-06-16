import { CalendarDays, Download } from 'lucide-react'

const AnalyticsHeader = () => (
  <header className="analytics-header">
    <div>
      <h1>Platform Analytics</h1>
      <p>Real-time performance metrics for AITasker</p>
    </div>

    <div className="analytics-header-actions">
      <button className="analytics-date-button" type="button">
        <CalendarDays size={16} />
        Oct 01 - Oct 31, 2024
      </button>
      <button className="analytics-export-button" type="button">
        <Download size={16} />
        Export Report
      </button>
    </div>
  </header>
)

export default AnalyticsHeader
