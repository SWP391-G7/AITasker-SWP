/**
 * Frontend module: Components/Dashboard/Admin/AdminStats.jsx
 *
 * Vai trò: Component Admin Stats: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Scale, ShieldAlert, TrendingUp, Users } from 'lucide-react'

// React component “Admin Stats” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const AdminStats = ({ userCount = 0, moderationCount, disputeCount }) => (
  <section className="admin-stats-grid">
    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Total Active Users</div>
        <div className="stat-value">{userCount.toLocaleString()}</div>
        <div className="stat-trend trend-up">
          <TrendingUp size={14} />
          <span>+4.2% from last week</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Users size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Pending Moderation</div>
        <div className="stat-value">{moderationCount}</div>
        <div className="stat-trend text-muted">
          <span>Avg response time: 2.4h</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <ShieldAlert size={20} />
      </div>
    </div>

    <div className="admin-stat-card">
      <div>
        <div className="stat-title">Open Disputes</div>
        <div className="stat-value">{disputeCount}</div>
        <div className="stat-trend text-muted">
          <span>8 resolved today</span>
        </div>
      </div>
      <div className="stat-icon-box">
        <Scale size={20} />
      </div>
    </div>
  </section>
)

export default AdminStats
