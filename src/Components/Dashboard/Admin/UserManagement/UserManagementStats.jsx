/**
 * Frontend module: Components/Dashboard/Admin/UserManagement/UserManagementStats.jsx
 *
 * Vai trò: Component User Management Stats: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { BadgeCheck, BrainCircuit, UserCheck, Users, ShieldAlert } from 'lucide-react'

const statIcons = {
  'total-users': Users,
  experts: BrainCircuit,
  clients: UserCheck,
  pending: BadgeCheck,
  suspended: ShieldAlert
}

// React component “User Management Stats” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const UserManagementStats = ({ stats }) => (
  <section className="user-management-stats" aria-label="User management summary">
    {stats.map(({ id, label, value, trend, tone }) => {
      const Icon = statIcons[id] || Users

      return (
        <article className={`user-stat-card tone-${tone}`} key={id}>
          <div className="user-stat-topline">
            <span className="user-stat-icon">
              <Icon size={18} />
            </span>
            <span className="user-stat-trend">{trend}</span>
          </div>
          <span className="user-stat-label">{label}</span>
          <strong>{value}</strong>
        </article>
      )
    })}
  </section>
)

export default UserManagementStats
