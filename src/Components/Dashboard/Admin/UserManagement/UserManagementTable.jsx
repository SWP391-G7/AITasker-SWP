import { BadgeCheck, ChevronLeft, ChevronRight, Search, SlidersHorizontal, UserPlus } from 'lucide-react'
import { managedUsers } from './userManagementData'

const statusClass = {
  Active: 'status-active',
  Suspended: 'status-suspended',
  Pending: 'status-pending'
}

const roleClass = {
  'AI Expert': 'role-expert',
  Client: 'role-client'
}

const UserManagementTable = () => (
  <section className="user-table-panel">
    <div className="user-table-toolbar">
      <div className="user-table-search">
        <Search size={16} />
        <input type="text" placeholder="Search experts, clients, or emails..." />
      </div>

      <div className="user-table-actions">
        <button type="button" className="ghost-tool-button">
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>
        <button type="button" className="primary-tool-button">
          <UserPlus size={14} />
          <span>Invite User</span>
        </button>
      </div>
    </div>

    <div className="user-table-wrap">
      <table className="user-management-table">
        <thead>
          <tr>
            <th>User Details</th>
            <th>Role</th>
            <th>Status</th>
            <th>Verified</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {managedUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <span className={`user-avatar avatar-${user.id}`}>{user.avatar}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </div>
              </td>
              <td>
                <span className={`role-pill ${roleClass[user.role]}`}>{user.role}</span>
              </td>
              <td>
                <span className={`status-pill ${statusClass[user.status]}`}>{user.status}</span>
              </td>
              <td>
                <span className={`verified-indicator ${user.verified ? 'is-verified' : ''}`}>
                  <BadgeCheck size={16} />
                </span>
              </td>
              <td>{user.joined}</td>
              <td>
                {user.status === 'Pending' ? (
                  <div className="row-actions">
                    <button type="button" className="approve-mini">Approve</button>
                    <button type="button" className="reject-mini">Reject</button>
                  </div>
                ) : (
                  <span className="quiet-action">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <footer className="user-table-footer">
      <span>Showing 1 to 10 of 12,482 users</span>
      <div className="pagination-controls">
        <button type="button" aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        <button type="button" aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  </section>
)

export default UserManagementTable
