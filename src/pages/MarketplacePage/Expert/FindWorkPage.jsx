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
          <div className="page-title-section" style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.5rem 0' }}>Find Work</h1>
            <p style={{ color: '#8a94a6', margin: 0 }}>Explore new opportunities that match your AI expertise.</p>
          </div>

          <div className="find-work-container">
            <JobFilters />
            
            <div className="job-list-container">
              <div className="job-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>
                  Showing {filteredJobs.length} jobs
                </span>
                <div className="sort-select" style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                  Sort by: <span style={{ color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }}>Newest First</span>
                </div>
              </div>

              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

              {filteredJobs.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', backgroundColor: '#121829', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p>No jobs found matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ExpertDashboardFooter />
      </main>
    </div>
  )
}

export default FindWorkPage
