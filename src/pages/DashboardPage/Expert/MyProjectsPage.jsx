import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  RefreshCcw,
  Trash2,
  Send,
} from 'lucide-react'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import { getMyServices, deleteService } from '../../../Services/serviceService'
import { getMyProjects } from '../../../Services/projectService'
import { getMyProposals } from '../../../Services/proposalService'
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../Client/ClientMarketplace.css'
import '../../ClientExpertSearchPage.css'

const parseMoney = (value) => Number(String(value || '0').replace(/[^0-9.]/g, '')) || 0
const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`

const MyProjectsPage = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [proposals, setProposals] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('expertProjectsTab') || 'projects'
  })

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const [servicesResult, projectsResult, proposalsResult] = await Promise.all([
        getMyServices(),
        getMyProjects(),
        getMyProposals()
      ])
      setServices(Array.isArray(servicesResult) ? servicesResult : [])
      setProjects(Array.isArray(projectsResult) ? projectsResult : [])
      setProposals(Array.isArray(proposalsResult) ? proposalsResult : [])
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    localStorage.setItem('expertProjectsTab', activeTab)
  }, [activeTab])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return projects.filter((project) =>
      (project.title || '').toLowerCase().includes(query) ||
      (project.client_name || '').toLowerCase().includes(query) ||
      (project.status || 'active').toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  const filteredProposals = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return proposals.filter((proposal) =>
      (proposal.job_title || '').toLowerCase().includes(query) ||
      (proposal.client_name || '').toLowerCase().includes(query) ||
      (proposal.status || '').toLowerCase().includes(query)
    )
  }, [proposals, searchQuery])

  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return services.filter((service) =>
      (service.title || '').toLowerCase().includes(query) ||
      (service.tags || '').toLowerCase().includes(query) ||
      (service.pricing_type || service.pricingType || '').toLowerCase().includes(query)
    )
  }, [services, searchQuery])

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
      await fetchDashboardData()
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
          title="My Projects"
          subtitle="Manage your projects, proposals, and services."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="projects-toolbar" style={{ marginBottom: '24px' }}>
          <div />

          <button className="draft-btn" type="button" onClick={fetchDashboardData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projects & Proposals
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              My Services
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>{error}</div>}
        {loading && <div className="alert alert-success" style={{ marginBottom: '24px' }}>Loading expert workspace...</div>}

        {!loading && !error && (
          <>
            {activeTab === 'projects' && (
              <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', alignItems: 'start' }}>

                {/* LEFT COLUMN: ACTIVE PROJECTS */}
                <div className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>Active Projects</h3>
                    <span className="project-status accepted-status" style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px' }}>{filteredProjects.length} Active</span>
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                      <BriefcaseBusiness size={42} style={{ opacity: 0.2, marginBottom: '16px' }} />
                      <h4 style={{ color: '#fff' }}>No Active Projects</h4>
                      <p style={{ fontSize: '0.9rem' }}>When a client hires you from a proposal, your active projects will appear here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => navigate(`/projects/${project.id}`)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{project.title || "Project Contract"}</h4>
                            <span className={`project-status ${project.status}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                              {project.status}
                            </span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {project.description || "No description provided."}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                            <span>Client: <strong>{project.client_name || "Client"}</strong></span>
                            <span>Budget: <strong>${project.total_amount}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: MY PROPOSALS */}
                <div className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>My Proposals</h3>
                    <span className="project-status" style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px' }}>{filteredProposals.length} Submitted</span>
                  </div>

                  {filteredProposals.length === 0 ? (
                    <div className="empty-projects" style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <Send size={42} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                      <h4 style={{ color: '#fff', marginBottom: '8px' }}>No Proposals Yet</h4>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Browse client tasks and submit proposals to get started.
                      </p>
                      <button className="next-btn" type="button" onClick={() => navigate('/marketplace?target=jobs')} style={{ cursor: 'pointer' }}>
                        Find Work
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {filteredProposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          onClick={() => navigate(`/expert/proposal/${proposal.id}`)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{proposal.job_title || "Untitled Task"}</h4>
                            <span className={`project-status ${proposal.status}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                              {proposal.status}
                            </span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {proposal.cover_letter || proposal.job_description || "No description provided."}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                            <span>Client: <strong>{proposal.client_name || "Client"}</strong></span>
                            <span>Bid: <strong>{formatMoney(proposal.bid_amount)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'services' && (
              <div className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>Published Services</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className="project-status" style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px' }}>{filteredServices.length} Services</span>
                    <button
                      className="next-btn"
                      type="button"
                      onClick={() => navigate('/expert/post-service')}
                      style={{ cursor: 'pointer', minWidth: 'auto', height: '36px', padding: '0 16px', fontSize: '0.85rem' }}
                    >
                      + New Service
                    </button>
                  </div>
                </div>

                {filteredServices.length === 0 ? (
                  <div className="empty-projects" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <BriefcaseBusiness size={42} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                    <h4 style={{ color: '#fff', marginBottom: '8px' }}>No Services Published</h4>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '20px' }}>You haven't posted any services yet.</p>
                    <button className="next-btn" type="button" onClick={() => navigate('/expert/post-service')} style={{ cursor: 'pointer' }}>
                      Post a New Service
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredServices.map((service) => {
                      const pricingType = service.pricing_type || service.pricingType || 'fixed'
                      return (
                        <div
                          key={service.id || service.title}
                          onClick={() => service.id && navigate(`/marketplace/service/${service.id}`)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{service.title || "Untitled Service"}</h4>
                            <span className="project-status" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                              {pricingType}
                            </span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {service.description || "No description provided."}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                            <span>Price: {formatMoney(service.price)}</span>
                            <button
                              type="button"
                              className="delete-project-btn"
                              disabled={deletingId === service.id}
                              onClick={(event) => handleDelete(event, service.id)}
                              style={{ border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                            >
                              <Trash2 size={12} />
                              {deletingId === service.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default MyProjectsPage