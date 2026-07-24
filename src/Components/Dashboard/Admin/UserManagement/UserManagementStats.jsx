import { BadgeCheck, BrainCircuit, UserCheck, Users, ShieldAlert } from 'lucide-react'

const statIcons = {
  'total-users': Users,
  experts: BrainCircuit,
  clients: UserCheck,
  pending: BadgeCheck,
  suspended: ShieldAlert
}

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
