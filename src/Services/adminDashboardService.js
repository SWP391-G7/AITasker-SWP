import { getMe } from './authService'
import { search } from './searchService'

const toNumber = (value) => Number(value) || 0

export const getAdminDashboardData = async () => {
  const [expertsResult, clientsResult, jobsResult, servicesResult] = await Promise.all([
    search({ target: 'expert' }),
    search({ target: 'client' }),
    search({ target: 'jobs' }),
    search({ target: 'services' }),
  ])

  const experts = expertsResult.results || []
  const clients = clientsResult.results || []
  const jobs = jobsResult.results || []
  const services = servicesResult.results || []

  return {
    experts,
    clients,
    jobs,
    services,
    users: [
      ...experts.map((user) => ({ ...user, dashboardRole: 'AI Expert' })),
      ...clients.map((user) => ({ ...user, dashboardRole: 'Client' })),
    ],
  }
}

export const getAdminProfile = async () => {
  const result = await getMe()
  return result.user || null
}

export const buildAdminModerationItems = (jobs = [], services = []) => [
  ...services.map((service) => ({
    id: `service-${service.id}`,
    target: service.title || 'Untitled Service',
    reason: service.description ? 'Service listing review' : 'Missing description',
    sourceType: 'service',
  })),
  ...jobs.map((job) => ({
    id: `job-${job.id}`,
    target: job.title || 'Untitled Job',
    reason: job.description ? 'Job post review' : 'Missing description',
    sourceType: 'job',
  })),
]

export const buildModerationQueueItems = (jobs = [], services = []) => [
  ...services.map((service) => ({
    id: `service-${service.id}`,
    title: service.title || 'Untitled Service',
    description: service.description || 'No service description provided.',
    category: 'Service',
    severity: service.description ? 'medium' : 'high',
    severityLabel: service.description ? 'Medium' : 'High',
    policy: service.description ? 'Marketplace Quality' : 'Incomplete Listing',
    type: service.tags || 'AI Service',
    time: 'From API',
    image: service.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=480&h=320&fit=crop',
  })),
  ...jobs.map((job) => ({
    id: `job-${job.id}`,
    title: job.title || 'Untitled Client Task',
    description: job.description || 'No job description provided.',
    category: 'Job',
    severity: job.description ? 'low' : 'high',
    severityLabel: job.description ? 'Low' : 'High',
    policy: job.description ? 'Project Quality' : 'Incomplete Job Post',
    type: job.required_skill || 'Client Job',
    time: 'From API',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=480&h=320&fit=crop',
  })),
]

export const buildManagedUsers = (users = []) =>
  users.map((user, index) => {
    const name = user.full_name || user.fullName || user.company_name || 'AITasker User'
    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return {
      id: user.id || index,
      name,
      email: user.email || 'Email not available',
      role: user.dashboardRole || (user.role === 'expert' ? 'AI Expert' : 'Client'),
      status: 'Active',
      verified: true,
      joined: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'From API',
      avatar: initials,
    }
  })

export const buildAnalytics = ({ experts = [], clients = [], jobs = [], services = [] }) => {
  const gross = services.reduce((sum, service) => sum + toNumber(service.price), 0)
  const avgPrice = services.length ? gross / services.length : 0
  const totalUsers = experts.length + clients.length

  return {
    kpis: [
      {
        label: 'Marketplace Revenue',
        value: `$${gross.toLocaleString()}`,
        trend: `${services.length} services`,
        tone: 'is-success',
        icon: 'revenue',
        progress: Math.min(100, services.length * 10),
      },
      {
        label: 'Posted Jobs',
        value: jobs.length.toLocaleString(),
        trend: 'From API',
        tone: 'is-success',
        icon: 'completion',
        progress: Math.min(100, jobs.length * 10),
      },
      {
        label: 'Active Users',
        value: totalUsers.toLocaleString(),
        trend: `${experts.length} experts`,
        tone: 'is-success',
        icon: 'experts',
        progress: Math.min(100, totalUsers * 10),
      },
      {
        label: 'Avg. Service Price',
        value: `$${Math.round(avgPrice).toLocaleString()}`,
        trend: 'Live catalog',
        tone: 'is-success',
        icon: 'price',
        progress: Math.min(100, avgPrice / 10),
      },
    ],
    topExperts: experts.slice(0, 5).map((expert, index) => ({
      id: expert.id || index,
      name: expert.full_name || 'AI Expert',
      avatar: `https://i.pravatar.cc/120?u=${expert.id || index}`,
      specialization: expert.professional_title || expert.skills || 'AI Specialist',
      completion: `${expert.avg_rating || 5}/5`,
      revenue: 'From services',
      status: 'Active',
    })),
  }
}
