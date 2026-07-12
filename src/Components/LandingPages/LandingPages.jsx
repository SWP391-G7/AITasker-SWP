import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LandingPages.css"
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileEdit,
  GitFork,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Star,
  Users,
  SlidersHorizontal,
} from "lucide-react"
import { isLoggedIn, getStoredUser } from "../../Services/checkLogin"
import { getMarketplaceServices } from "../../Services/serviceService"
import { search } from "../../Services/searchService"
import Footer from "../Footer/Footer"

const serviceIconStyles = [
  {
    icon: <MessageSquare size={24} className="text-primary" />,
    bg: "rgba(59, 130, 246, 0.1)",
  },
  {
    icon: <BarChart3 size={24} className="text-success" />,
    bg: "rgba(16, 185, 129, 0.1)",
  },
  {
    icon: <GitFork size={24} className="text-info" />,
    bg: "rgba(6, 182, 212, 0.1)",
  },
  {
    icon: <Cpu size={24} className="text-danger" />,
    bg: "rgba(239, 68, 68, 0.1)",
  },
]

const jobIconStyles = [
  {
    icon: <Briefcase size={24} className="text-warning" />,
    bg: "rgba(245, 158, 11, 0.1)",
  },
  {
    icon: <FileEdit size={24} className="text-primary" />,
    bg: "rgba(59, 130, 246, 0.1)",
  },
  {
    icon: <BarChart3 size={24} className="text-success" />,
    bg: "rgba(16, 185, 129, 0.1)",
  },
  {
    icon: <Cpu size={24} className="text-danger" />,
    bg: "rgba(239, 68, 68, 0.1)",
  },
]

const parseServiceTags = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.filter(Boolean).slice(0, 2)

  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 2)
}

const LandingPages = () => {
  const navigate = useNavigate()
  const defaultTargetByRole = () => {
    const role = (getStoredUser()?.role || "").toLowerCase()
    return role === "expert" ? "client" : "expert"
  }
  const [target, setTarget] = useState(defaultTargetByRole) // 'expert', 'client', 'services', 'jobs'
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState("")
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState("")
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [expertsData, setExpertsData] = useState([])
  const [expertsDataLoading, setExpertsDataLoading] = useState(true)

  const [filters, setFilters] = useState({
    budgetMin: '',
    budgetMax: '',
    requiredSkill: '',
    duration: '',
    priceMin: '',
    priceMax: '',
    pricingType: '',
    skill: '',
    experience: '',
    professionalTitle: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    industry: '',
    companyName: ''
  })

  const storedUser = getStoredUser()
  const isLoggedInUser = isLoggedIn()
  const userRole = (storedUser?.role || "").toLowerCase()
  const isExpertUser = isLoggedInUser && userRole === "expert"

  const formatJobCard = (job, index) => {
    const style = jobIconStyles[index % jobIconStyles.length]
    const skills = parseServiceTags(job.required_skill)
    const budget = job.budget_max
      ? `$${Number(job.budget_min || 0).toLocaleString()} - $${Number(job.budget_max).toLocaleString()}`
      : `From $${Number(job.budget_min || 0).toLocaleString()}`
    return {
      id: job.id,
      icon: style.icon,
      bg: style.bg,
      title: job.title || "Untitled Job",
      desc: `Budget: ${budget}${job.duration_days ? ` · ${job.duration_days} days` : ""}`,
      tags: skills.length ? skills : ["Open"],
      _type: "job",
    }
  }

  const formatServiceCard = (service, index) => {
    const style = serviceIconStyles[index % serviceIconStyles.length]
    const tags = parseServiceTags(service.tags)
    return {
      id: service.id,
      icon: style.icon,
      bg: style.bg,
      title: service.title || "Untitled Service",
      desc: service.description || "No description provided.",
      tags: tags.length ? tags : [service.pricing_type || "Service"],
      _type: "service",
    }
  }

  // Fetch services (always needed)
  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      try {
        setServicesLoading(true)
        setServicesError("")
        const apiServices = await getMarketplaceServices()
        if (!isMounted) return
        setServices(apiServices.slice(0, 4).map(formatServiceCard))
      } catch (error) {
        console.error("Failed to fetch services:", error)
        if (isMounted) { setServicesError("Unable to load popular services."); setServices([]) }
      } finally { if (isMounted) setServicesLoading(false) }
    }
    fetch()
    return () => { isMounted = false }
  }, [])

  // Fetch jobs (for not-logged-in and expert)
  useEffect(() => {
    if (isLoggedInUser && !isExpertUser) return
    let isMounted = true
    const fetch = async () => {
      try {
        setJobsLoading(true)
        setJobsError("")
        const result = await search({ target: "jobs" })
        if (!isMounted) return
        setJobs((result.results || []).slice(0, 4).map(formatJobCard))
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        if (isMounted) { setJobsError("Unable to load popular jobs."); setJobs([]) }
      } finally { if (isMounted) setJobsLoading(false) }
    }
    fetch()
    return () => { isMounted = false }
  }, [isLoggedInUser, isExpertUser])

  // Fetch clients (for not-logged-in and expert)
  useEffect(() => {
    if (isLoggedInUser && !isExpertUser) return
    let isMounted = true
    const fetch = async () => {
      try {
        setClientsLoading(true)
        const result = await search({ target: "client" })
        if (!isMounted) return
        setClients((result.results || []).slice(0, 4))
      } catch { if (isMounted) setClients([]) }
      finally { if (isMounted) setClientsLoading(false) }
    }
    fetch()
    return () => { isMounted = false }
  }, [isLoggedInUser, isExpertUser])

  // Fetch experts (for not-logged-in and client)
  useEffect(() => {
    if (isLoggedInUser && isExpertUser) return
    let isMounted = true
    const fetch = async () => {
      try {
        setExpertsDataLoading(true)
        const result = await search({ target: "expert" })
        if (!isMounted) return
        setExpertsData((result.results || []).slice(0, 4))
      } catch { if (isMounted) setExpertsData([]) }
      finally { if (isMounted) setExpertsDataLoading(false) }
    }
    fetch()
    return () => { isMounted = false }
  }, [isLoggedInUser, isExpertUser])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()
    params.append('target', target)
    if (query.trim()) {
      params.append('query', query.trim())
    }

    if (target === 'jobs') {
      if (filters.budgetMin) params.append('budgetMin', filters.budgetMin)
      if (filters.budgetMax) params.append('budgetMax', filters.budgetMax)
      if (filters.requiredSkill) params.append('requiredSkill', filters.requiredSkill)
      if (filters.duration) params.append('duration', filters.duration)
    } else if (target === 'services') {
      if (filters.priceMin) params.append('priceMin', filters.priceMin)
      if (filters.priceMax) params.append('priceMax', filters.priceMax)
      if (filters.pricingType) params.append('pricingType', filters.pricingType)
    } else if (target === 'expert') {
      if (filters.skill) params.append('skill', filters.skill)
      if (filters.experience) params.append('experience', filters.experience)
      if (filters.professionalTitle) params.append('professionalTitle', filters.professionalTitle)
      if (filters.hourlyRateMin) params.append('hourlyRateMin', filters.hourlyRateMin)
      if (filters.hourlyRateMax) params.append('hourlyRateMax', filters.hourlyRateMax)
    } else if (target === 'client') {
      if (filters.industry) params.append('industry', filters.industry)
      if (filters.companyName) params.append('companyName', filters.companyName)
    }

    const path = target === 'expert' || target === 'client'
      ? `/clients-experts?${params.toString()}`
      : `/marketplace?${params.toString()}`

    requireLogin(() => navigate(path))
  }

  const requireLogin = (fallback) => {
    if (isLoggedIn()) {
      fallback()
      return
    }
    navigate("/login", {
      state: { message: "Please log in or create an account to use this feature." },
    })
  }

  return (
    <div className="landing-wrapper">
      <section id="explore" className="hero-section d-flex align-items-center justify-content-center min-vh-100">
        <div className="container text-center hero-content">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-9">
              <h1 className="hero-title mb-4">
                Automate Your Business with <br />
                <span className="gradient-text">Top AI Experts</span>
              </h1>

              <p className="hero-description lead mb-5">
                The premium B2B marketplace for custom AI solutions, from advanced
                machine learning models to intelligent workflow automation.
              </p>

              {/* Target category tabs */}
              <div className="search-category-tabs d-flex justify-content-center gap-2 mb-3">
                <button
                  type="button"
                  className={`category-tab-btn ${target === 'expert' ? 'active' : ''}`}
                  onClick={() => { setTarget('expert'); setShowFilters(false) }}
                >
                  Experts
                </button>
                <button
                  type="button"
                  className={`category-tab-btn ${target === 'client' ? 'active' : ''}`}
                  onClick={() => { setTarget('client'); setShowFilters(false) }}
                >
                  Clients
                </button>
                <button
                  type="button"
                  className={`category-tab-btn ${target === 'services' ? 'active' : ''}`}
                  onClick={() => { setTarget('services'); setShowFilters(false) }}
                >
                  Services
                </button>
                <button
                  type="button"
                  className={`category-tab-btn ${target === 'jobs' ? 'active' : ''}`}
                  onClick={() => { setTarget('jobs'); setShowFilters(false) }}
                >
                  Jobs
                </button>
              </div>

              <form className="hero-search-form mx-auto mb-5" onSubmit={handleSearch}>
                <div className="search-box-wrapper d-flex align-items-center">
                  <div className="search-icon-container ms-3 me-2">
                    <Search size={20} className="search-icon" />
                  </div>
                  <input
                    type="text"
                    className="form-control search-input shadow-none border-0 bg-transparent text-white"
                    placeholder={`Search for ${target === 'expert' ? 'AI experts...' : target === 'client' ? 'clients...' : target === 'services' ? 'AI services...' : 'posted jobs...'}`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className={`btn filter-toggle-btn me-2 ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    title="Toggle Advanced Filters"
                  >
                    <SlidersHorizontal size={18} />
                  </button>
                  <button type="submit" className="btn search-button py-2 px-4 me-1 fw-bold rounded-pill">
                    Search
                  </button>
                </div>

                {/* Collapsible advanced filters container */}
                {showFilters && (
                  <div className="advanced-filters-panel mt-3 text-start">
                    <h4 className="filters-panel-title mb-3">Filter Criteria</h4>

                    {target === 'jobs' && (
                      <div className="row g-3">
                        <div className="col-12 col-sm-6 col-md-3">
                          <label className="filter-label">Min Budget ($)</label>
                          <input
                            type="number"
                            name="budgetMin"
                            className="form-control filter-input"
                            placeholder="Min budget"
                            value={filters.budgetMin}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-3">
                          <label className="filter-label">Max Budget ($)</label>
                          <input
                            type="number"
                            name="budgetMax"
                            className="form-control filter-input"
                            placeholder="Max budget"
                            value={filters.budgetMax}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-3">
                          <label className="filter-label">Required Skill</label>
                          <input
                            type="text"
                            name="requiredSkill"
                            className="form-control filter-input"
                            placeholder="e.g. Python, NLP"
                            value={filters.requiredSkill}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-3">
                          <label className="filter-label">Max Duration (Days)</label>
                          <input
                            type="number"
                            name="duration"
                            className="form-control filter-input"
                            placeholder="Duration in days"
                            value={filters.duration}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>
                    )}

                    {target === 'services' && (
                      <div className="row g-3">
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Min Price ($)</label>
                          <input
                            type="number"
                            name="priceMin"
                            className="form-control filter-input"
                            placeholder="Min price"
                            value={filters.priceMin}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Max Price ($)</label>
                          <input
                            type="number"
                            name="priceMax"
                            className="form-control filter-input"
                            placeholder="Max price"
                            value={filters.priceMax}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Pricing Type</label>
                          <select
                            name="pricingType"
                            className="form-select filter-input"
                            value={filters.pricingType}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Pricing Types</option>
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly Contract</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {target === 'expert' && (
                      <div className="row g-3">
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Skill Keyword</label>
                          <input
                            type="text"
                            name="skill"
                            className="form-control filter-input"
                            placeholder="e.g. PyTorch, LLM"
                            value={filters.skill}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Experience (Years/Level)</label>
                          <input
                            type="text"
                            name="experience"
                            className="form-control filter-input"
                            placeholder="e.g. 5 years, senior"
                            value={filters.experience}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Professional Title</label>
                          <input
                            type="text"
                            name="professionalTitle"
                            className="form-control filter-input"
                            placeholder="e.g. AI Architect"
                            value={filters.professionalTitle}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 offset-md-2 col-md-4">
                          <label className="filter-label">Min Hourly Rate ($)</label>
                          <input
                            type="number"
                            name="hourlyRateMin"
                            className="form-control filter-input"
                            placeholder="Min $/hr"
                            value={filters.hourlyRateMin}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-md-4">
                          <label className="filter-label">Max Hourly Rate ($)</label>
                          <input
                            type="number"
                            name="hourlyRateMax"
                            className="form-control filter-input"
                            placeholder="Max $/hr"
                            value={filters.hourlyRateMax}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>
                    )}

                    {target === 'client' && (
                      <div className="row g-3">
                        <div className="col-12 col-sm-6">
                          <label className="filter-label">Industry</label>
                          <input
                            type="text"
                            name="industry"
                            className="form-control filter-input"
                            placeholder="e.g. FinTech, Healthcare"
                            value={filters.industry}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="filter-label">Company Name</label>
                          <input
                            type="text"
                            name="companyName"
                            className="form-control filter-input"
                            placeholder="Search company"
                            value={filters.companyName}
                            onChange={handleFilterChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>

              <div className="cta-wrapper d-flex flex-sm-row flex-column justify-content-center gap-3">
                <button className="btn btn-primary btn-lg fw-bold rounded-3 px-4 py-3" onClick={() => requireLogin(() => navigate("/clients-experts?target=expert"))}>
                  Hire an Expert
                </button>
                <button className="btn btn-secondary btn-lg fw-bold rounded-3 px-4 py-3" onClick={() => requireLogin(() => navigate(isExpertUser ? "/expert/post-service" : "/client/post-job"))}>
                  {!isLoggedInUser ? "Get Started" : isExpertUser ? "Post a Service" : "Post a Job"}
                </button>
              </div>
            </div>
          </div>
        </div >
      </section >

      {/* ---- Popular Services ---- */}
      {(!isLoggedInUser || !isExpertUser) && (
        <section id="services" className="services-section py-5">
          <div className="container px-3 px-sm-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <div className="text-start">
                <h2 className="section-title fw-extrabold mb-2 text-white">{!isLoggedInUser ? "Popular Services" : "Popular Services"}</h2>
                <p className="section-subtitle text-muted mb-0">In-demand AI capabilities for enterprise</p>
              </div>
              <button className="view-all-link fw-bold d-flex align-items-center gap-1" onClick={() => requireLogin(() => navigate("/marketplace?target=services"))}>
                View all services <span className="arrow-icon">-&gt;</span>
              </button>
            </div>

            {servicesLoading ? (
              <p className="text-muted mb-0">Loading popular services...</p>
            ) : servicesError ? (
              <div>
                <p className="text-muted mb-2">{servicesError}</p>
                <button className="btn btn-outline-light btn-sm" onClick={() => window.location.reload()}>Try again</button>
              </div>
            ) : services.length === 0 ? (
              <p className="text-muted mb-0">No popular services available yet.</p>
            ) : (
              <div className="row g-4">
                {services.map((svc) => (
                  <div key={svc.id || svc.title} className="col-12 col-sm-6 col-lg-3">
                    <div className="service-card p-4 h-100 d-flex flex-column align-items-start text-start" style={{ cursor: "pointer" }} onClick={() => requireLogin(() => navigate(`/marketplace/service/${svc.id}`, { state: { fromLanding: true } }))}>
                      <div className="service-icon-box mb-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: svc.bg }}>
                        {svc.icon}
                      </div>
                      <h3 className="service-card-title fw-bold mb-2">{svc.title}</h3>
                      <p className="service-card-desc text-muted mb-4">{svc.desc}</p>
                      <div className="service-tags mt-auto d-flex gap-2">
                        {svc.tags.map((tag) => (
                          <span key={tag} className="service-tag px-3 py-1 rounded-pill">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---- Popular Jobs ---- */}
      {!isLoggedInUser || isExpertUser ? (
        <section id="popular-jobs" className="services-section py-5">
          <div className="container px-3 px-sm-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <div className="text-start">
                <h2 className="section-title fw-extrabold mb-2 text-white">Popular Jobs</h2>
                <p className="section-subtitle text-muted mb-0">Top freelance opportunities for AI experts</p>
              </div>
              <button className="view-all-link fw-bold d-flex align-items-center gap-1" onClick={() => requireLogin(() => navigate("/marketplace?target=jobs"))}>
                View all jobs <span className="arrow-icon">-&gt;</span>
              </button>
            </div>

            {jobsLoading ? (
              <p className="text-muted mb-0">Loading popular jobs...</p>
            ) : jobsError ? (
              <div>
                <p className="text-muted mb-2">{jobsError}</p>
                <button className="btn btn-outline-light btn-sm" onClick={() => window.location.reload()}>Try again</button>
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-muted mb-0">No popular jobs available yet.</p>
            ) : (
              <div className="row g-4">
                {jobs.map((job) => (
                  <div key={job.id || job.title} className="col-12 col-sm-6 col-lg-3">
                    <div className="service-card p-4 h-100 d-flex flex-column align-items-start text-start" style={{ cursor: "pointer" }} onClick={() => requireLogin(() => navigate(`/marketplace/task/${job.id}`, { state: { fromLanding: true } }))}>
                      <div className="service-icon-box mb-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: job.bg }}>
                        {job.icon}
                      </div>
                      <h3 className="service-card-title fw-bold mb-2">{job.title}</h3>
                      <p className="service-card-desc text-muted mb-4">{job.desc}</p>
                      <div className="service-tags mt-auto d-flex gap-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="service-tag px-3 py-1 rounded-pill">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="how-it-works-section py-5 text-center">
        <div className="container px-3 px-sm-5 py-4">
          <h2 className="section-title fw-extrabold mb-2" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>How It Works</h2>
          {!isLoggedInUser ? (
            <p className="section-subtitle mb-5" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>For Clients &amp; AI Experts</p>
          ) : isExpertUser ? (
            <p className="section-subtitle mb-5" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>For AI Experts</p>
          ) : (
            <p className="section-subtitle mb-5" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>For Clients</p>
          )}

          <div className="position-relative mt-5">
            <div className="timeline-line d-none d-lg-block"></div>

            {!isLoggedInUser ? (
              <>
                <h4 className="fw-bold mb-4" style={{ color: "var(--text-muted)", fontSize: "1rem", letterSpacing: "1px", textTransform: "uppercase" }}>For Clients</h4>
                <div className="row justify-content-between g-5 position-relative z-2 mb-5">
                  <div className="col-12 col-lg-4 text-center">
                    <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                      <FileEdit size={20} className="text-primary" />
                    </div>
                    <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1. Post a Job</h3>
                    <p className="step-desc text-muted px-lg-4">
                      Describe your AI project requirements, timeline, and budget.
                    </p>
                  </div>
                  <div className="col-12 col-lg-4 text-center">
                    <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                      <Users size={20} className="text-primary" />
                    </div>
                    <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2. Match with Experts</h3>
                    <p className="step-desc text-muted px-lg-4">
                      Review proposals from vetted AI specialists and data scientists.
                    </p>
                  </div>
                  <div className="col-12 col-lg-4 text-center">
                    <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                      <ShieldCheck size={20} className="text-primary" />
                    </div>
                    <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3. Safely Pay via Escrow</h3>
                    <p className="step-desc text-muted px-lg-4">
                      Funds are securely held until you approve the delivered work.
                    </p>
                  </div>
                </div>

                <h4 className="fw-bold mb-4" style={{ color: "var(--text-muted)", fontSize: "1rem", letterSpacing: "1px", textTransform: "uppercase" }}>For AI Experts</h4>
                <div className="row justify-content-between g-5 position-relative z-2">
                  <div className="col-12 col-lg-4 text-center">
                    <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                      <Search size={20} className="text-primary" />
                    </div>
                    <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1. Browse Jobs</h3>
                    <p className="step-desc text-muted px-lg-4">
                      Find AI projects that match your skills and expertise.
                    </p>
                  </div>
                  <div className="col-12 col-lg-4 text-center">
                    <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                      <Send size={20} className="text-primary" />
                    </div>
                    <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2. Submit Proposal</h3>
                    <p className="step-desc text-muted px-lg-4">
                      Send your tailored proposal to clients and stand out.
                    </p>
                  </div>
                  <div className="col-12 col-lg-4 text-center">
                    <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                      <ShieldCheck size={20} className="text-primary" />
                    </div>
                    <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3. Get Paid via Escrow</h3>
                    <p className="step-desc text-muted px-lg-4">
                      Receive payments securely through our escrow system.
                    </p>
                  </div>
                </div>
              </>
            ) : isExpertUser ? (
              <div className="row justify-content-between g-5 position-relative z-2">
                <div className="col-12 col-lg-4 text-center">
                  <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                    <Search size={20} className="text-primary" />
                  </div>
                  <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1. Browse Jobs</h3>
                  <p className="step-desc text-muted px-lg-4">
                    Find AI projects that match your skills and expertise.
                  </p>
                </div>
                <div className="col-12 col-lg-4 text-center">
                  <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                    <Send size={20} className="text-primary" />
                  </div>
                  <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2. Submit Proposal</h3>
                  <p className="step-desc text-muted px-lg-4">
                    Send your tailored proposal to clients and stand out.
                  </p>
                </div>
                <div className="col-12 col-lg-4 text-center">
                  <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3. Get Paid via Escrow</h3>
                  <p className="step-desc text-muted px-lg-4">
                    Receive payments securely through our escrow system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="row justify-content-between g-5 position-relative z-2">
                <div className="col-12 col-lg-4 text-center">
                  <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                    <FileEdit size={20} className="text-primary" />
                  </div>
                  <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1. Post a Job</h3>
                  <p className="step-desc text-muted px-lg-4">
                    Describe your AI project requirements, timeline, and budget.
                  </p>
                </div>
                <div className="col-12 col-lg-4 text-center">
                  <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                    <Users size={20} className="text-primary" />
                  </div>
                  <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2. Match with Experts</h3>
                  <p className="step-desc text-muted px-lg-4">
                    Review proposals from vetted AI specialists and data scientists.
                  </p>
                </div>
                <div className="col-12 col-lg-4 text-center">
                  <div className="timeline-badge-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <h3 className="step-title fw-bold mb-3" style={{ background: "linear-gradient(to right, #60a5fa, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3. Safely Pay via Escrow</h3>
                  <p className="step-desc text-muted px-lg-4">
                    Funds are securely held until you approve the delivered work.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Featured Experts ---- */}
      {(!isLoggedInUser || !isExpertUser) && (
        <section id="experts" className="experts-section py-5">
          <div className="container px-3 px-sm-5 py-4">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <div className="text-start">
                <h2 className="section-title fw-extrabold mb-2 text-white">Featured Experts</h2>
                <p className="section-subtitle text-muted mb-0">Top-rated professionals ready to hire</p>
              </div>
              <div className="carousel-nav d-none d-sm-flex gap-2">
                <span className="carousel-btn d-flex align-items-center justify-content-center" aria-label="Previous" style={{ opacity: 0.3, cursor: "default" }}>
                  <ChevronLeft size={20} />
                </span>
                <span className="carousel-btn d-flex align-items-center justify-content-center" aria-label="Next" style={{ opacity: 0.3, cursor: "default" }}>
                  <ChevronRight size={20} />
                </span>
              </div>
            </div>

            <div className="row g-4">
              {expertsDataLoading ? (
                <p className="text-muted text-center w-100">Loading experts...</p>
              ) : expertsData.length === 0 ? (
                <p className="text-muted text-center w-100">No featured experts available yet.</p>
              ) : (
                expertsData.map((exp) => (
                  <div key={exp.id} className="col-12 col-sm-6 col-lg-3">
                    <div className="expert-card p-4 h-100 text-center d-flex flex-column align-items-center">
                      <div className="expert-avatar-wrapper mb-4 position-relative d-flex align-items-center justify-content-center" style={{ background: exp.avatar_url ? "transparent" : "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
                        {exp.avatar_url ? (
                          <img src={exp.avatar_url} alt={exp.full_name} className="expert-avatar-img" />
                        ) : (
                          <span style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                            {(exp.full_name || "E").charAt(0).toUpperCase()}
                          </span>
                        )}
                        {exp.avg_rating > 0 && (
                          <div className="expert-rating px-2 py-1 rounded-pill d-flex align-items-center gap-1 shadow">
                            <Star size={12} className="text-warning fill-warning" />
                            <span>{Number(exp.avg_rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="expert-name fw-bold mb-1">{exp.full_name || "Expert"}</h3>
                      <p className="expert-role text-muted mb-4">{exp.professional_title || "AI Expert"}</p>

                      <div className="expert-footer w-100 mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                        <span className="expert-rate fw-bold">{exp.hourly_rate || "Price TBD"}</span>
                        <button className="btn btn-hire px-3 py-2 fw-semibold rounded-3 text-white" onClick={() => requireLogin(() => navigate("/clients-experts?target=expert"))}>
                          Hire Me
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---- Featured Clients ---- */}
      {(!isLoggedInUser || isExpertUser) && (
        <section className="experts-section py-5">
          <div className="container px-3 px-sm-5 py-4">
            <div className="d-flex justify-content-between align-items-end mb-5">
              <div className="text-start">
                <h2 className="section-title fw-extrabold mb-2 text-white">Featured Clients</h2>
                <p className="section-subtitle text-muted mb-0">Top companies hiring AI talent</p>
              </div>
              <div className="carousel-nav d-none d-sm-flex gap-2">
                <span className="carousel-btn d-flex align-items-center justify-content-center" aria-label="Previous" style={{ opacity: 0.3, cursor: "default" }}>
                  <ChevronLeft size={20} />
                </span>
                <span className="carousel-btn d-flex align-items-center justify-content-center" aria-label="Next" style={{ opacity: 0.3, cursor: "default" }}>
                  <ChevronRight size={20} />
                </span>
              </div>
            </div>

            <div className="row g-4">
              {clientsLoading ? (
                <p className="text-muted text-center w-100">Loading clients...</p>
              ) : clients.length === 0 ? (
                <p className="text-muted text-center w-100">No featured clients available yet.</p>
              ) : (
                clients.map((client) => (
                  <div key={client.id} className="col-12 col-sm-6 col-lg-3">
                    <div className="expert-card p-4 h-100 text-center d-flex flex-column align-items-center" style={{ cursor: "pointer" }} onClick={() => navigate(`/client/clients/${client.id}`, { state: { fromLanding: true } })}>
                      <div className="expert-avatar-wrapper mb-4 position-relative d-flex align-items-center justify-content-center" style={{ background: client.avatar_url ? "transparent" : "linear-gradient(135deg, #3b82f6, #60a5fa)" }}>
                        {client.avatar_url ? (
                          <img src={client.avatar_url} alt={client.company_name || client.full_name} className="expert-avatar-img" />
                        ) : (
                          <span style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                            {(client.company_name || client.full_name || "C").charAt(0).toUpperCase()}
                          </span>
                        )}
                        {client.avg_rating > 0 && (
                          <div className="expert-rating px-2 py-1 rounded-pill d-flex align-items-center gap-1 shadow">
                            <Star size={12} className="text-warning fill-warning" />
                            <span>{Number(client.avg_rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="expert-name fw-bold mb-1">{client.company_name || client.full_name || "Client"}</h3>
                      <p className="expert-role text-muted mb-4">{client.industry || "Client"}</p>

                      <div className="expert-footer w-100 mt-auto pt-3 border-top d-flex align-items-center justify-content-center">
                        <button className="btn btn-hire px-3 py-2 fw-semibold rounded-3 text-white">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <Footer variant="landing" />
    </div >
  )
}

export default LandingPages
