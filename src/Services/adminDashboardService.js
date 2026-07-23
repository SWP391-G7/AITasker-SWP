import axios from 'axios'

// Lấy URL gốc của backend từ biến môi trường Vite.
// Nếu chưa cấu hình file .env thì frontend sẽ gọi backend mặc định ở localhost:5000/api.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Tạo một axios instance riêng cho admin dashboard.
const adminDashboardApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor để tự động chèn JWT token
adminDashboardApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Chuyển các giá trị như price/count/rating từ API về number.
const toNumber = (value) => Number(value) || 0

const moderationVisualClasses = [
  'service-visual-automation',
  'service-visual-analytics',
  'service-visual-network',
]

const getPrimaryContentImage = (images, legacyImageUrl = null) => {
  if (Array.isArray(images)) {
    return images.find((image) => typeof image === 'string' && image.trim()) || legacyImageUrl
  }

  if (typeof images === 'string' && images.trim()) {
    try {
      const parsedImages = JSON.parse(images)
      if (Array.isArray(parsedImages)) {
        return parsedImages.find((image) => typeof image === 'string' && image.trim()) || legacyImageUrl
      }
      if (typeof parsedImages === 'string' && parsedImages.trim()) {
        return parsedImages
      }
    } catch {
      return images.trim()
    }
  }

  return legacyImageUrl
}

// Lấy toàn bộ dữ liệu nền cho các màn admin từ api thực tế
export const getAdminDashboardData = async (status = 'pending') => {
  const [usersRes, contentRes] = await Promise.all([
    adminDashboardApi.get('/admin/users'),
    adminDashboardApi.get(`/admin/content?status=${status}`)
  ])

  return {
    users: usersRes.data.users || [],
    jobs: contentRes.data.jobs || [],
    services: contentRes.data.services || []
  }
}

// Lấy riêng danh sách user cho trang UserManagementPage.
export const getAdminUsersData = async () => {
  const { data } = await adminDashboardApi.get('/admin/users')
  return data.users || []
}

// Lấy thông tin admin hiện tại từ token đang lưu trong localStorage.
export const getAdminProfile = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No authentication token found')
  }

  const { data } = await adminDashboardApi.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return data.user || null
}

// Các hàm gọi API mới phục vụ quản lý user và content
export const adminCreateUser = async (userData) => {
  const { data } = await adminDashboardApi.post('/admin/users', userData)
  return data.user
}

export const adminUpdateUser = async (id, userData) => {
  const { data } = await adminDashboardApi.put(`/admin/users/${id}`, userData)
  return data.user
}

export const adminDeleteUser = async (id) => {
  const { data } = await adminDashboardApi.delete(`/admin/users/${id}`)
  return data
}

export const adminDeactivateUser = async (id, status) => {
  const { data } = await adminDashboardApi.patch(`/admin/users/${id}/status`, { acc_status: status })
  return data.user
}

export const getAdminContent = async ({ type = 'all', status = 'all' }) => {
  const { data } = await adminDashboardApi.get('/admin/content', {
    params: { type, status }
  })
  return data
}

// Fetch platform-wide aggregates calculated by the protected admin analytics endpoint.
export const getAdminAnalytics = async ({ from, to } = {}) => {
  const { data } = await adminDashboardApi.get('/admin/analytics', {
    params: { ...(from && { from }), ...(to && { to }) },
  })
  return data
}

export const updateContentStatus = async (type, id, status) => {
  const { data } = await adminDashboardApi.put(`/admin/content/${type}/${id}/status`, { status })
  return data.content
}

// Tạo danh sách moderation đơn giản cho widget trên trang AdminDashboardPage.
//
// Đây là bản rút gọn của moderation queue:
// - Chỉ cần id, target, reason, sourceType.
// - Dùng cho khối hiển thị nhanh trên dashboard chính.
//
// Nếu service/job thiếu description thì reason sẽ là "Missing description",
// còn nếu có description thì chỉ đánh dấu là cần review chất lượng nội dung.
export const buildAdminModerationItems = (jobs = [], services = []) => [
  ...services.map((service) => ({
    // Prefix "service-" để id không bị trùng với job có cùng numeric id.
    id: `service-${service.id}`,
    // target là tên item được hiển thị trên dashboard.
    // Nếu API thiếu title thì dùng fallback để UI không bị trống.
    target: service.title || 'Untitled Service',
    reason: service.description ? 'Service listing review' : 'Missing description',
    sourceType: 'service',
  })),
  ...jobs.map((job) => ({
    // Prefix "job-" để phân biệt item này đến từ bảng/list jobs.
    id: `job-${job.id}`,
    target: job.title || 'Untitled Job',
    reason: job.description ? 'Job post review' : 'Missing description',
    sourceType: 'job',
  })),
]

// Tạo queue moderation chi tiết hơn cho trang ContentModerationPage.
//
// So với buildAdminModerationItems, hàm này tạo nhiều field hơn để component hiển thị card/list đầy đủ:
// - title, description: nội dung chính.
// - category: Service hoặc Job.
// - severity/severityLabel: mức độ ưu tiên xử lý.
// - policy: nhóm chính sách/chất lượng liên quan.
// - type: tag/kỹ năng/loại item.
// - time: hiện đang để "From API" vì backend chưa trả thời gian moderation riêng.
// - image: ảnh hiển thị, ưu tiên ảnh API nếu có, nếu không dùng ảnh fallback.
//
// Severity cao khi bài đăng/service thiếu description, vì item thiếu mô tả thường cần admin xử lý trước.
export const buildModerationQueueItems = (jobs = [], services = []) => [
  ...services.map((service, index) => ({
    id: `service-${service.id}`,
    detailPath: `/marketplace/service/${service.id}`,
    title: service.title || 'Untitled Service',
    description: service.description || 'No service description provided.',
    category: 'Service',
    severity: service.description ? 'medium' : 'high',
    severityLabel: service.description ? 'Medium' : 'High',
    // Nếu có description thì item chỉ cần review chất lượng marketplace.
    // Nếu thiếu description thì coi là listing chưa hoàn chỉnh.
    policy: service.description ? 'Marketplace Quality' : 'Incomplete Listing',
    // service.tags có thể là string hoặc dữ liệu tag từ API; nếu thiếu thì dùng nhãn chung.
    type: service.tags || 'AI Service',
    time: 'From API',
    // Ưu tiên ảnh service từ backend. Nếu chưa có ảnh thì dùng ảnh mẫu để card không bị vỡ layout.
    image: getPrimaryContentImage(service.images, service.image_url || service.imageUrl),
    imageClass: moderationVisualClasses[index % moderationVisualClasses.length],
    status: service.status || 'pending',
  })),
  ...jobs.map((job, index) => ({
    id: `job-${job.id}`,
    detailPath: `/marketplace/task/${job.id}`,
    title: job.title || 'Untitled Client Task',
    description: job.description || 'No job description provided.',
    category: 'Job',
    severity: job.description ? 'low' : 'high',
    severityLabel: job.description ? 'Low' : 'High',
    // Job có description thì ưu tiên thấp hơn service vì chỉ cần review chất lượng project.
    // Job thiếu description thì đánh dấu incomplete để admin chú ý.
    policy: job.description ? 'Project Quality' : 'Incomplete Job Post',
    // required_skill là kỹ năng client yêu cầu cho job; nếu thiếu thì dùng nhãn chung.
    type: job.required_skill || 'Client Job',
    time: 'From API',
    // Job hiện chưa có image_url riêng nên dùng ảnh fallback cố định.
    image: getPrimaryContentImage(job.images, job.image_url || job.imageUrl),
    imageClass: moderationVisualClasses[index % moderationVisualClasses.length],
    status: job.status || 'pending',
  })),
]

// Chuyển danh sách user từ API thành format mà UserManagementTable đang cần.
//
// API của expert/client có thể trả field tên khác nhau:
// - full_name
// - fullName
// - company_name
//
// Hàm này gom các kiểu đó về một field thống nhất là name,
// đồng thời tạo thêm role/status/verified/joined/avatar để bảng user hiển thị ổn định.
export const buildManagedUsers = (users = []) =>
  users.map((user, index) => {
    // Ưu tiên tên cá nhân, sau đó đến tên công ty, cuối cùng dùng fallback chung.
    const name = user.full_name || user.fullName || user.company_name || 'AITasker User'

    // Tạo avatar dạng chữ cái đầu của tên, ví dụ "Nguyen Van A" -> "NV".
    // Cách này giúp bảng vẫn có avatar kể cả khi API chưa có ảnh đại diện.
    const initials = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    // Map role to display nicely
    let displayRole = 'Client';
    if (user.role === 'expert') {
      displayRole = 'AI Expert';
    } else if (user.role === 'admin') {
      displayRole = 'Admin';
    }

    return {
      // Nếu API không có id thì dùng index làm fallback để React table vẫn có key ổn định tạm thời.
      id: user.id || index,
      name,
      email: user.email || 'Email not available',
      role: displayRole,
      status: user.acc_status === false ? 'Suspended' : 'Active',
      verified: user.is_verified ?? false,
      // created_at nếu có thì format sang ngày theo locale máy người dùng.
      // Nếu thiếu thì dùng "From API" để báo dữ liệu đến từ API nhưng chưa có ngày.
      joined: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'From API',
      avatar: initials,
      avatarUrl: user.avatar_url || user.avatarUrl || null,
    }
  })

// Tính KPI và danh sách top experts cho trang AnalyticsPage từ dữ liệu live lấy qua search API.
//
// Lưu ý: các chỉ số ở đây là chỉ số suy ra từ dữ liệu hiện có, chưa phải analytics backend thật.
// Khi backend có endpoint doanh thu/giao dịch/rating chính thức thì nên thay phần tính toán này bằng data thật.
export const buildAnalytics = ({ experts = [], clients = [], jobs = [], services = [] }) => {
  // Tạm tính "Marketplace Revenue" bằng tổng price của tất cả service trong catalog.
  // Đây chưa phải doanh thu giao dịch thật, vì chưa dựa trên order/payment thành công.
  const gross = services.reduce((sum, service) => sum + toNumber(service.price), 0)

  // Giá service trung bình = tổng price / số service.
  // Nếu không có service nào thì để 0 để tránh chia cho 0.
  const avgPrice = services.length ? gross / services.length : 0

  // Tổng user admin nhìn thấy hiện tại = expert + client.
  const totalUsers = experts.length + clients.length

  return {
    kpis: [
      {
        // KPI 1: tổng giá service trong marketplace.
        label: 'Marketplace Revenue',
        value: `$${gross.toLocaleString()}`,
        trend: `${services.length} services`,
        tone: 'is-success',
        icon: 'revenue',
        // progress chỉ dùng cho UI progress bar, giới hạn tối đa 100%.
        progress: Math.min(100, services.length * 10),
      },
      {
        // KPI 2: tổng số job/task client đã đăng.
        label: 'Posted Jobs',
        value: jobs.length.toLocaleString(),
        trend: 'From API',
        tone: 'is-success',
        icon: 'completion',
        progress: Math.min(100, jobs.length * 10),
      },
      {
        // KPI 3: tổng số user đang hiển thị trong hệ thống admin.
        label: 'Active Users',
        value: totalUsers.toLocaleString(),
        trend: `${experts.length} experts`,
        tone: 'is-success',
        icon: 'experts',
        progress: Math.min(100, totalUsers * 10),
      },
      {
        // KPI 4: giá trung bình của service trong catalog.
        label: 'Avg. Service Price',
        value: `$${Math.round(avgPrice).toLocaleString()}`,
        trend: 'Live catalog',
        tone: 'is-success',
        icon: 'price',
        progress: Math.min(100, avgPrice / 10),
      },
    ],
    // Lấy tối đa 5 expert đầu tiên làm danh sách top expert.
    // Hiện tại chưa sort theo doanh thu/rating thật, vì search API chưa trả dữ liệu ranking đầy đủ.
    topExperts: experts.slice(0, 5).map((expert, index) => ({
      id: expert.id || index,
      name: expert.full_name || 'AI Expert',
      // Dùng pravatar theo id/index để mỗi expert có một avatar mẫu khác nhau.
      avatar: `https://i.pravatar.cc/120?u=${expert.id || index}`,
      // Ưu tiên professional_title, nếu thiếu thì dùng skills, cuối cùng dùng fallback chung.
      specialization: expert.professional_title || expert.skills || 'AI Specialist',
      // avg_rating nếu API có thì dùng, nếu không có thì tạm hiển thị 5/5.
      completion: `${expert.avg_rating || 5}/5`,
      // Chưa có doanh thu theo từng expert nên để text tạm.
      revenue: 'From services',
      status: 'Active',
    })),
  }
}

const clampPercentage = (value) => Math.min(100, Math.max(0, Number(value) || 0))
const formatCurrency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

// Convert raw analytics API values into the display model used by the dashboard widgets.
export const buildLiveAnalytics = (data = {}) => {
  const summary = data.summary || {}
  const monthlyRevenue = data.revenueByMonth || []
  const engagement = data.engagement || {}
  const maximumMonthlyRevenue = Math.max(0, ...monthlyRevenue.map((item) => Number(item.revenue) || 0))
  const selectedYear = Number(data.period?.from?.slice(0, 4))
  const now = new Date()
  const activeMonth = selectedYear === now.getFullYear()
    ? `${selectedYear}-${String(now.getMonth() + 1).padStart(2, '0')}`
    : `${selectedYear}-12`

  return {
    kpis: [
      {
        label: 'Released Revenue',
        value: formatCurrency(summary.totalRevenue),
        trend: 'Completed escrow',
        tone: 'is-success',
        icon: 'revenue',
        // Revenue has no fixed target yet, so a non-zero value fills the decorative track.
        progress: Number(summary.totalRevenue) > 0 ? 100 : 0,
      },
      {
        label: 'Completion Rate',
        value: `${clampPercentage(summary.completionRate).toFixed(1)}%`,
        trend: `${summary.completedProjects || 0}/${summary.totalProjects || 0} projects`,
        tone: 'is-success',
        icon: 'completion',
        progress: clampPercentage(summary.completionRate),
      },
      {
        label: 'Active Experts',
        value: Number(summary.activeExperts || 0).toLocaleString(),
        trend: 'Enabled accounts',
        tone: 'is-success',
        icon: 'experts',
        progress: Math.min(100, Number(summary.activeExperts || 0) * 10),
      },
      {
        label: 'Avg. Task Price',
        value: formatCurrency(summary.averageTaskPrice),
        trend: 'Started projects',
        tone: 'is-success',
        icon: 'price',
        progress: Number(summary.averageTaskPrice) > 0 ? 100 : 0,
      },
    ],
    revenueBars: monthlyRevenue.map((item) => ({
      label: item.label,
      amount: Number(item.revenue) || 0,
      value: maximumMonthlyRevenue && Number(item.revenue) > 0
        ? Math.max(4, ((Number(item.revenue) || 0) / maximumMonthlyRevenue) * 100)
        : 0,
      active: item.monthKey === activeMonth,
    })),
    engagementMetrics: [
      {
        label: 'Client Engagement',
        value: `${clampPercentage(engagement.clientRate).toFixed(1)}%`,
        progress: clampPercentage(engagement.clientRate),
        tone: 'blue',
      },
      {
        label: 'Expert Engagement',
        value: `${clampPercentage(engagement.expertRate).toFixed(1)}%`,
        progress: clampPercentage(engagement.expertRate),
        tone: 'teal',
      },
      {
        label: 'Inactive Accounts',
        value: `${clampPercentage(engagement.inactiveAccountRate).toFixed(1)}%`,
        progress: clampPercentage(engagement.inactiveAccountRate),
        tone: 'rose',
      },
    ],
    // Keep the UI capped at five rows even if a future API version returns more experts.
    topExperts: (data.topExperts || []).slice(0, 5).map((expert) => ({
      id: expert.id,
      name: expert.name || 'AI Expert',
      avatar: expert.avatarUrl || null,
      specialization: expert.specialization || 'AI Specialist',
      completion: `${clampPercentage(expert.completionRate).toFixed(1)}%`,
      revenue: formatCurrency(expert.revenue),
      status: expert.status || 'Active',
    })),
    period: data.period || {},
    definitions: data.definitions || {},
  }
}
