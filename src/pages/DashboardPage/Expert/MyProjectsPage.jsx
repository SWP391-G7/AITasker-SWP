import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import ProjectOverviewCards from '../../../Components/Dashboard/Expert/MyProjects/ProjectOverviewCards'
import ProjectDeliverables from '../../../Components/Dashboard/Expert/MyProjects/ProjectDeliverables'
import { myProjects } from '../../../Components/Dashboard/Expert/MyProjects/projectsData'
import { createHandleLogout } from './handleLogout'
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

  const handleLogout = createHandleLogout(navigate)

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
          title="My Projects"
          subtitle="Manage your active AI contracts and deliverables."
          headerActions={
            <div className="expert-rating-widget">
              <span>Expert Rating</span>
              <div className="expert-rating-value">
                <span>4.98</span>
                <Star size={16} fill="currentColor" />
              </div>
            </div>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="expert-content-container">
          <ProjectOverviewCards />

          <ProjectDeliverables projects={filteredProjects} />
        </div>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default MyProjectsPage
