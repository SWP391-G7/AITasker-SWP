import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertDashboardFooter from '../../../Components/Dashboard/Expert/ExpertDashboardFooter'
import JobFilters from '../../../Components/Dashboard/Expert/FindWork/JobFilters'
import JobCard from '../../../Components/Dashboard/Expert/FindWork/JobCard'
import { jobListings } from '../../../Components/Dashboard/Expert/FindWork/jobsData'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/FindWork/FindWorkPage.css'

const FindWorkPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  const filteredJobs = jobListings.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="work" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="expert-content-container">
          <div className="page-header-row">
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.5rem 0' }}>Find Work</h1>
              <p style={{ color: '#8a94a6', margin: 0 }}>Browse high-value AI opportunities from global companies.</p>
            </div>
            <div className="jobs-count-badge">
              428 New Jobs Today
            </div>
          </div>

          <JobFilters />
          
          <div className="job-list-stack">
            {jobListings.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        <ExpertDashboardFooter />
      </main>
    </div>
  )
}

export default FindWorkPage
