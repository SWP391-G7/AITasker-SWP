import axios from 'axios'

// Lấy URL gốc của backend từ biến môi trường Vite.
// Nếu chưa cấu hình file .env thì frontend sẽ gọi backend mặc định ở localhost:5000/api.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Tạo một axios instance riêng cho admin dashboard.
// Lợi ích:
// - Không phải lặp lại baseURL ở từng request.
// - Các request trong file này mặc định gửi/nhận JSON.
// - Sau này nếu cần thêm interceptor hoặc token mặc định cho admin thì thêm ở đây là đủ.
const adminDashboardApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Read the latest auth token every time an admin request is made.
// This avoids using a stale token if the admin logs in again during the same browser session.
const getAdminAuthHeaders = () => {
  // The login flow stores the JWT under "token" in localStorage.
  const token = localStorage.getItem('token')

  // Return only JSON headers when there is no token, so unauthenticated calls fail normally.
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Convert backend role values into the labels already used by the admin table.
// The backend stores enum values like "expert", while the UI displays "AI Expert".
const formatAdminUserRole = (role) => {
  // Expert accounts should be shown with the product-facing label.
  if (role === 'expert') return 'AI Expert'

  // Client accounts keep the simple human label.
  if (role === 'client') return 'Client'

  // Admin accounts now come from the real /admin/users API too.
  if (role === 'admin') return 'Admin'

  // Fallback keeps the UI from breaking if a future backend role appears.
  return role || 'User'
}

// Create a compact avatar text from the user's display name.
// Example: "Nguyen Van A" becomes "NV".
const getAdminUserInitials = (name) =>
  String(name || 'AU')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

// Chuyển các giá trị như price/count/rating từ API về number.
// API đôi khi trả số dưới dạng string, ví dụ "100" thay vì 100.
// Nếu value bị rỗng, null, undefined hoặc không chuyển được thành số thì dùng 0 để tránh lỗi khi tính toán.
const toNumber = (value) => Number(value) || 0

// Helper gọi API search cho từng loại dữ liệu admin cần.
//
// target có thể là:
// - "expert": lấy danh sách AI Expert.
// - "client": lấy danh sách Client.
// - "jobs": lấy danh sách job/task do client đăng.
// - "services": lấy danh sách service do expert tạo.
//
// Request thực tế sẽ có dạng:
// GET http://localhost:5000/api/search?target=expert
//
// Hàm này trả về format giống searchService cũ:
// {
//   results: [...],
//   count: number,
//   target: string
// }
// Nhờ vậy các hàm phía dưới không cần biết axios trả data như thế nào.
const searchAdminTarget = async (target) => {
  const { data } = await adminDashboardApi.get('/search', {
    params: { target },
  })

  return {
    results: data.results || [],
    count: data.count || 0,
    target: data.target,
  }
}

// Lấy toàn bộ dữ liệu nền cho các màn admin.
//
// Hàm này đang dùng chung endpoint /search hiện có thay vì có một endpoint riêng kiểu /admin/dashboard.
// Nó gọi 4 request cùng lúc bằng Promise.all để trang admin load nhanh hơn:
// - experts
// - clients
// - jobs
// - services
//
// Kết quả trả về là object tổng hợp để các page admin tái sử dụng:
// - AdminDashboardPage dùng users, jobs, services để hiện thống kê/moderation.
// - UserManagementPage dùng users để hiện bảng quản lý người dùng.
// - ContentModerationPage dùng jobs/services để tạo queue kiểm duyệt.
// - AnalyticsPage dùng toàn bộ dữ liệu để tính KPI.
export const getAdminDashboardData = async () => {
  const [expertsResult, clientsResult, jobsResult, servicesResult] = await Promise.all([
    searchAdminTarget('expert'),
    searchAdminTarget('client'),
    searchAdminTarget('jobs'),
    searchAdminTarget('services'),
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
      // Gộp expert và client vào cùng một mảng users để admin quản lý chung.
      // dashboardRole là field frontend tự thêm vào, không nhất thiết có trong database.
      // Field này giúp UI hiển thị role đẹp hơn: "AI Expert" hoặc "Client".
      ...experts.map((user) => ({ ...user, dashboardRole: 'AI Expert' })),
      ...clients.map((user) => ({ ...user, dashboardRole: 'Client' })),
    ],
  }
}

// Lấy riêng danh sách user cho trang UserManagementPage.
//
// Trang quản lý user chỉ cần expert + client, không cần jobs/services.
// Tách hàm này ra để nếu API jobs hoặc services bị lỗi thì bảng user vẫn hiển thị bình thường.
export const getAdminUsersData = async () => {
  // Use the real admin users endpoint instead of the public /search endpoint.
  // This returns every user role, including admin users and users without completed profiles.
  const { data } = await adminDashboardApi.get('/admin/users', {
    // Admin endpoints must receive the Bearer token from localStorage.
    headers: getAdminAuthHeaders(),
  })

  // The backend controller returns { success, count, users }.
  // Returning only users keeps the old page-level call shape simple.
  return data.users || []
}

// Delete a user by id through the real admin CRUD API.
// The page asks for browser confirmation before calling this function.
export const deleteAdminUser = async (userId) => {
  // DELETE /admin/users/:id performs the hard delete on the backend.
  const { data } = await adminDashboardApi.delete(`/admin/users/${userId}`, {
    // Token is required because only admins should delete users.
    headers: getAdminAuthHeaders(),
  })

  // Return backend response so the page can remove the row or show an error if needed.
  return data
}

// Deactivate a user by id through the real admin ban endpoint.
// Deactivate means acc_status=false on the backend.
export const deactivateAdminUser = async (userId) => {
  // PUT /admin/users/:id/deactivate soft-bans the account without deleting data.
  const { data } = await adminDashboardApi.put(`/admin/users/${userId}/deactivate`, null, {
    // Token is required because only admins should ban users.
    headers: getAdminAuthHeaders(),
  })

  // Return the updated user from the backend response.
  return data
}

// Convert real /admin/users response rows into the table row format used by UserManagementTable.
// This mapper is separate from the older buildManagedUsers helper because this one understands accStatus.
export const buildRealAdminUsers = (users = []) =>
  // Map each backend user object into the exact fields consumed by the table component.
  users.map((user, index) => {
    // Prefer the real admin API field first, then support older snake_case fields as fallback.
    const name = String(user?.fullName || user?.full_name || user?.company_name || 'AITasker User')

    // The backend returns accStatus in normalized responses and acc_status in raw SQL-style responses.
    const accStatus = user?.accStatus ?? user?.acc_status

    // The backend returns isVerified in normalized responses and is_verified in raw SQL-style responses.
    const isVerified = user?.isVerified ?? user?.is_verified

    // The backend returns createdAt in normalized responses and created_at in raw SQL-style responses.
    const createdAt = user?.createdAt || user?.created_at

    // Return the row shape expected by the existing admin user table.
    return {
      // Use database id for actions like delete/deactivate; index is only a last-resort display fallback.
      id: user?.id || index,

      // Show the best available name in the first table column.
      name,

      // Show email under the name, with a stable fallback when backend data is incomplete.
      email: String(user?.email || 'Email not available'),

      // Keep the raw backend role for future edit forms.
      rawRole: user?.role,

      // Convert backend enum role into the human label already used by the table.
      role: formatAdminUserRole(user?.role),

      // accStatus=false means the admin has banned/deactivated the account.
      status: accStatus === false ? 'Suspended' : 'Active',

      // Show the real verification state from the backend.
      verified: Boolean(isVerified),

      // Format the created date for UI display.
      joined: createdAt ? new Date(createdAt).toLocaleDateString() : 'From API',

      // Use generated initials because users do not have avatar image URLs in the current schema.
      avatar: getAdminUserInitials(name),
    }
  })

// Lấy thông tin admin hiện tại từ token đang lưu trong localStorage.
//
// Luồng:
// 1. Lấy token sau khi user login.
// 2. Nếu không có token thì throw error để page gọi hàm này biết là chưa đăng nhập.
// 3. Gọi GET /auth/me kèm Authorization Bearer token.
// 4. Trả về data.user nếu backend xác thực thành công.
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
  ...services.map((service) => ({
    id: `service-${service.id}`,
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
    image: service.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=480&h=320&fit=crop',
  })),
  ...jobs.map((job) => ({
    id: `job-${job.id}`,
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
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=480&h=320&fit=crop',
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

    return {
      // Nếu API không có id thì dùng index làm fallback để React table vẫn có key ổn định tạm thời.
      id: user.id || index,
      name,
      email: user.email || 'Email not available',
      // dashboardRole được thêm ở getAdminDashboardData hoặc getAdminUsersData.
      // Nếu không có dashboardRole thì fallback theo user.role từ backend.
      role: user.dashboardRole || (user.role === 'expert' ? 'AI Expert' : 'Client'),
      // Hiện backend/search chưa trả trạng thái quản lý user chi tiết, nên tạm để Active.
      status: 'Active',
      // Tạm coi user là verified để UI hiển thị; khi backend có field verification thì nên thay bằng dữ liệu thật.
      verified: true,
      // created_at nếu có thì format sang ngày theo locale máy người dùng.
      // Nếu thiếu thì dùng "From API" để báo dữ liệu đến từ API nhưng chưa có ngày.
      joined: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'From API',
      avatar: initials,
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
