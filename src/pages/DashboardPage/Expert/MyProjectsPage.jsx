import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import ProjectOverviewCards from '../../../Components/Dashboard/Expert/MyProjects/ProjectOverviewCards'
import ProjectDeliverables from '../../../Components/Dashboard/Expert/MyProjects/ProjectDeliverables'
import { getMarketplaceJobs } from '../../../Services/serviceService'
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/MyProjects/MyProjectsPage.css'

const MyProjectsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)
  const [projects, setProjects] = useState([])
  const [projectError, setProjectError] = useState('')

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

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Number(value) || 0)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectError('')

        // API data: experts browse real client job posts from GET /api/search?target=jobs.
        const jobs = await getMarketplaceJobs()
        setProjects(
          (Array.isArray(jobs) ? jobs : []).map((job) => ({
            id: job.id,
            name: job.title || 'Untitled Client Task',
            client: job.client_name || job.company_name || 'Client',
            status: (job.status || 'OPEN').toUpperCase(),
            statusType: job.status === 'completed' ? 'review' : 'active',
            milestone: job.duration_days ? `0/${Math.max(1, Number(job.duration_days))}` : '0/1',
            deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline',
            progress: job.status === 'completed' ? 100 : 0,
            price: formatCurrency(job.budget_max ?? job.budget_min ?? 0),
          }))
        )
      } catch (err) {
        setProjectError(err.message || 'Failed to load client projects.')
        setProjects([])
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const overviewStats = useMemo(() => {
    const totalRevenue = projects.reduce((sum, project) => {
      const amount = Number(String(project.price).replace(/[^0-9.]/g, ''))
      return sum + (Number.isFinite(amount) ? amount : 0)
    }, 0)

    return {
      activeContracts: projects.length,
      totalRevenue: formatCurrency(totalRevenue),
      projectedRevenue: formatCurrency(totalRevenue),
      upcomingMilestones: String(projects.filter((project) => project.deadline !== 'No deadline').length).padStart(2, '0'),
    }
  }, [projects])

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
          {projectError && <div className="alert alert-danger">{projectError}</div>}

          <ProjectOverviewCards {...overviewStats} />

          <ProjectDeliverables projects={filteredProjects} />
        </div>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default MyProjectsPage
