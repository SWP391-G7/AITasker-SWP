/**
 * Frontend module: Components/Dashboard/Admin/UserGrowthChart.jsx
 *
 * Vai trò: Component User Growth Chart: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
const DAYS_IN_CHART = 7
const CHART_WIDTH = 700
const CHART_HEIGHT = 220
const CHART_PADDING = 28

// Chuyển đổi dữ liệu cho “format date key” thành định dạng mà lớp gọi hoặc giao diện cần.
const formatDateKey = (date) => date.toISOString().slice(0, 10)

// Chuyển đổi dữ liệu cho “build last seven days” thành định dạng mà lớp gọi hoặc giao diện cần.
const buildLastSevenDays = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: DAYS_IN_CHART }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (DAYS_IN_CHART - 1 - index))

    return {
      key: formatDateKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    }
  })
}

// Chuyển đổi dữ liệu cho “build growth points” thành định dạng mà lớp gọi hoặc giao diện cần.
const buildGrowthPoints = (users = []) => {
  const days = buildLastSevenDays()
  const registrationCounts = days.reduce((counts, day) => {
    counts[day.key] = 0
    return counts
  }, {})

  // Backend returns users with created_at, so FE only groups those dates into the 7 chart buckets.
  users.forEach((user) => {
    if (!user.created_at) return

    const createdDate = new Date(user.created_at)
    if (Number.isNaN(createdDate.getTime())) return

    const createdKey = formatDateKey(createdDate)
    if (createdKey in registrationCounts) {
      registrationCounts[createdKey] += 1
    }
  })

  // Scale each point against the biggest day so low seed data still creates a readable line.
  const maxRegistrations = Math.max(...Object.values(registrationCounts), 1)
  const chartInnerWidth = CHART_WIDTH - CHART_PADDING * 2
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING * 2

  return days.map((day, index) => {
    const value = registrationCounts[day.key]
    const x = CHART_PADDING + (chartInnerWidth / (DAYS_IN_CHART - 1)) * index
    const y = CHART_HEIGHT - CHART_PADDING - (value / maxRegistrations) * chartInnerHeight

    return {
      ...day,
      value,
      x,
      y,
      highlighted: index === days.length - 1,
    }
  })
}

// React component “User Growth Chart” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const UserGrowthChart = ({ users = [] }) => {
  const growthPoints = buildGrowthPoints(users)
  const totalNewUsers = growthPoints.reduce((sum, point) => sum + point.value, 0)
  const linePath = growthPoints.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPath = [
    `M ${growthPoints[0].x} ${CHART_HEIGHT - CHART_PADDING}`,
    `L ${growthPoints.map((point) => `${point.x} ${point.y}`).join(' L ')}`,
    `L ${growthPoints[growthPoints.length - 1].x} ${CHART_HEIGHT - CHART_PADDING}`,
    'Z',
  ].join(' ')

  return (
    <section className="chart-panel-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h2 className="panel-title mb-1">New User Growth</h2>
          <p className="text-muted small mb-0">Daily registrations over the last 7 days</p>
        </div>
        <div className="chart-legend">
          <span className="legend-dot"></span>
          <span>{totalNewUsers} new users</span>
        </div>
      </div>

      <div className="custom-line-chart">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="New user growth line chart">
          <defs>
            <linearGradient id="userGrowthArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((position) => (
            <line
              key={position}
              className="line-chart-grid"
              x1={CHART_PADDING}
              x2={CHART_WIDTH - CHART_PADDING}
              y1={CHART_PADDING + (CHART_HEIGHT - CHART_PADDING * 2) * position}
              y2={CHART_PADDING + (CHART_HEIGHT - CHART_PADDING * 2) * position}
            />
          ))}

          <path className="line-chart-area" d={areaPath} />
          <polyline className="line-chart-stroke" points={linePath} />

          {growthPoints.map((point) => (
            <g key={point.key} className="line-chart-point-group">
              <circle
                className={`line-chart-point ${point.highlighted ? 'highlighted' : ''}`}
                cx={point.x}
                cy={point.y}
                r={point.highlighted ? 6 : 5}
              />
              <text className="line-chart-value" x={point.x} y={point.y - 12} textAnchor="middle">
                {point.value}
              </text>
              <text className="line-chart-label" x={point.x} y={CHART_HEIGHT - 6} textAnchor="middle">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}

export default UserGrowthChart
