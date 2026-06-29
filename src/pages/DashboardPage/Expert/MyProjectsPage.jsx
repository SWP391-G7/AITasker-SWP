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
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../Client/ClientMarketplace.css'

const parseMoney = (value) => Number(String(value || '0').replace(/[^0-9.]/g, '')) || 0
const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`

const formatDate = (value) => {
  if (!value) return 'Published service'
  return new Date(value).toLocaleDateString()
}

const getProgress = (service) => {
  if (typeof service.progress === 'number') return service.progress
  return 0
}

const MyProjectsPage = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
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

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await getMyServices()
      setServices(Array.isArray(result) ? result : [])
    } catch (err) {
      setError(err.message || 'Failed to load your services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

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
      await fetchServices()
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
          subtitle="Track all AI services you have posted for clients."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="post-form-card">
          <div className="projects-toolbar">
            <div>
              <h2 className="projects-title">Published Services</h2>
              <p className="projects-subtitle">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <button className="draft-btn" type="button" onClick={fetchServices} disabled={loading}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading && <div className="alert alert-success">Loading projects...</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && filteredServices.length === 0 && (
            <div className="empty-projects">
              <BriefcaseBusiness size={42} />
              <h3>No services yet</h3>
              <p>You have not posted any services. Start by creating a new service.</p>
              <button className="next-btn" type="button" onClick={() => navigate('/expert/post-service')}>
                Post a New Service
              </button>
            </div>
          )}

          {!loading && !error && filteredServices.length > 0 && (
            <div className="project-list">
              {filteredServices.map((service) => {
                const progress = getProgress(service)
                const pricingType = service.pricing_type || service.pricingType || 'fixed'
                const deliveryDays = service.delivery_days ?? service.deliveryDays

                return (
                  <article
                    className="project-card"
                    key={service.id || service.title}
                    onClick={() => (service.id ? navigate(`/marketplace/service/${service.id}`) : null)}
                  >
                    <div className="project-card-header">
                      <div>
                        <h3>{service.title || 'Untitled Service'}</h3>
                        <span>{service.tags || 'AI Service'}</span>
                      </div>

                      <div className="project-card-actions">
                        <span className="project-status">{pricingType}</span>

                        <button
                          type="button"
                          className="delete-project-btn"
                          disabled={deletingId === service.id}
                          onClick={(event) => handleDelete(event, service.id)}
                        >
                          <Trash2 size={14} />
                          {deletingId === service.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <p className="project-description">{service.description || 'No description provided.'}</p>

                    <div className="project-meta">
                      <span>
                        <DollarSign size={16} />
                        {formatMoney(service.price)}
                      </span>

                      <span>
                        <CalendarDays size={16} />
                        {deliveryDays ? `${deliveryDays} days delivery` : formatDate(service.created_at || service.createdAt)}
                      </span>
                    </div>

                    <div className="client-project-progress">
                      <div>
                        <span>Progress</span>
                        <strong>{progress}%</strong>
                      </div>
                      <div className="progress-line">
                        <div style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default MyProjectsPage
