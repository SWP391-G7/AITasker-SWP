import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  RefreshCcw,
  Trash2,
} from 'lucide-react'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import { getMyServices, deleteService } from '../../../Services/serviceService'
import { getMyProjects } from '../../../Services/projectService'
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../Client/ClientMarketplace.css'

const parseMoney = (value) => Number(String(value || '0').replace(/[^0-9.]/g, '')) || 0
const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`

const MyProjectsPage = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

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

  const fetchServicesAndProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const [servicesResult, projectsResult] = await Promise.all([
        getMyServices(),
        getMyProjects()
      ])
      setServices(Array.isArray(servicesResult) ? servicesResult : [])
      setProjects(Array.isArray(projectsResult) ? projectsResult : [])
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServicesAndProjects()
  }, [])

  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return services.filter((service) =>
      (service.title || '').toLowerCase().includes(query) ||
      (service.tags || '').toLowerCase().includes(query) ||
      (service.pricing_type || service.pricingType || '').toLowerCase().includes(query)
    )
  }, [services, searchQuery])

  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return projects.filter((project) =>
      (project.title || '').toLowerCase().includes(query) ||
      (project.client_name || '').toLowerCase().includes(query) ||
      (project.status || 'active').toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  const handleDelete = async (event, serviceId) => {
    event.stopPropagation()

    if (!serviceId) {
      setError('Cannot delete this service because service ID is missing.')
      return
    }

    const ok = window.confirm('Are you sure you want to delete this service?')
    if (!ok) return

    try {
      setDeletingId(serviceId)
      setError('')
      await deleteService(serviceId)
      await fetchServicesAndProjects()
    } catch (err) {
      setError(err.message || 'Failed to delete service.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="market-client-layout expert-projects-client-style">
      <ExpertSidebar activeTab="projects" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="post-job-main">
        <ExpertHeader
          title="My Workspace"
          subtitle="Manage your published services and current project contracts."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="post-form-card" style={{ maxWidth: '100%', width: '100%' }}>
          <div className="projects-toolbar" style={{ marginBottom: '20px' }}>
            <div>
              <h2 className="projects-title" style={{ fontSize: '1.4rem' }}>Dashboard Overview</h2>
              <p className="projects-subtitle">
                Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} and {filteredProjects.length} project contract{filteredProjects.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button className="draft-btn" type="button" onClick={fetchServicesAndProjects} disabled={loading}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading && <div className="alert alert-success">Loading items...</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <div className="split-tables-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                
                {/* Left Table: Published Services */}
                <div className="table-wrapper-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BriefcaseBusiness size={20} className="text-primary" />
                    My Published Services
                  </h3>
                  
                  {filteredServices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>No services published yet.</p>
                      <button className="next-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} type="button" onClick={() => navigate('/expert/post-service')}>
                        Post a New Service
                      </button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '12px 8px' }}>Title</th>
                            <th style={{ padding: '12px 8px' }}>Price</th>
                            <th style={{ padding: '12px 8px' }}>Type</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredServices.map((service) => {
                            const pricingType = service.pricing_type || service.pricingType || 'fixed'
                            return (
                              <tr 
                                key={service.id || service.title} 
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onClick={() => service.id && navigate(`/marketplace/service/${service.id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: '500' }}>{service.title || 'Untitled Service'}</td>
                                <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{formatMoney(service.price)}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span className="project-status" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                    {pricingType}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="delete-project-btn"
                                    style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                    disabled={deletingId === service.id}
                                    onClick={(event) => handleDelete(event, service.id)}
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Table: Active Projects */}
                <div className="table-wrapper-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BriefcaseBusiness size={20} className="text-success" />
                    My Active Projects
                  </h3>
                  
                  {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No project contracts found.</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>Submit proposals to client job posts to get hired.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '12px 8px' }}>Title</th>
                            <th style={{ padding: '12px 8px' }}>Budget</th>
                            <th style={{ padding: '12px 8px' }}>Client</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProjects.map((project) => {
                            return (
                              <tr 
                                key={project.id} 
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: '500' }}>{project.title || 'Untitled Project'}</td>
                                <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>${parseFloat(project.total_amount).toLocaleString()}</td>
                                <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{project.client_name || 'Client'}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span className={`project-status ${
                                    project.status === 'completed' ? 'accepted-status' : project.status === 'terminated' ? 'rejected-status' : 'active-status'
                                  }`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                    {project.status || 'active'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default MyProjectsPage
