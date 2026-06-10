import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertDashboardFooter from '../../../Components/Dashboard/Expert/ExpertDashboardFooter'
import ProjectOverviewCards from '../../../Components/Dashboard/Expert/MyProjects/ProjectOverviewCards'
import ProjectDeliverables from '../../../Components/Dashboard/Expert/MyProjects/ProjectDeliverables'
import { myProjects } from '../../../Components/Dashboard/Expert/MyProjects/projectsData'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/MyProjects/MyProjectsPage.css'

const MyProjectsPage = () => {
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

  const filteredProjects = myProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="projects" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="expert-content-container" style={{ padding: '0 1.5rem 1.5rem' }}>
          <div className="page-title-section" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.5rem 0' }}>My Projects</h1>
              <p style={{ color: '#8a94a6', margin: 0 }}>Manage your active AI contracts and deliverables.</p>
            </div>
            <div className="expert-rating-widget" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontWeight: '700' }}>Expert Rating</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                <span style={{ fontWeight: '800', color: '#ffffff' }}>4.98</span>
                <span style={{ fontSize: '1.1rem' }}>★</span>
              </div>
            </div>
          </div>

          <ProjectOverviewCards />
          
          <ProjectDeliverables projects={filteredProjects} />
        </div>

        <ExpertDashboardFooter />
      </main>
    </div>
  )
}

export default MyProjectsPage
