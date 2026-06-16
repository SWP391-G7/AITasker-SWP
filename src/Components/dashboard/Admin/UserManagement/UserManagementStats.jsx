import { BadgeCheck, BrainCircuit, UserCheck, Users } from 'lucide-react'
import { userManagementStats } from './userManagementData'

const statIcons = {
  'total-users': Users,
  experts: BrainCircuit,
  clients: UserCheck,
  pending: BadgeCheck
}

const UserManagementStats = () => (
  <section className="user-management-stats" aria-label="User management summary">
    {userManagementStats.map(({ id, label, value, trend, tone }) => {
      const Icon = statIcons[id]

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
