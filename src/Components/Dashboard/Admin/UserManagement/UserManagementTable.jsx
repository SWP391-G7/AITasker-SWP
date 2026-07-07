import { BadgeCheck, ChevronLeft, ChevronRight, SlidersHorizontal, UserPlus, Eye, Edit2, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react'

const statusClass = {
  Active: 'status-active',
  Suspended: 'status-suspended',
  Pending: 'status-pending'
}

const roleClass = {
  'AI Expert': 'role-expert',
  Client: 'role-client',
  Admin: 'role-admin'
}

const UserManagementTable = ({ 
  users = [], 
  searchQuery = '', 
  onViewUser, 
  onEditUser, 
  onDeleteUser, 
  onToggleBan,
  onOpenCreateModal
}) => {
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    )
  })

  return (
  <section className="user-table-panel">
    <div className="user-table-toolbar">
      <div className="user-table-actions">
        <button type="button" className="ghost-tool-button">
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>
        <button type="button" className="primary-tool-button" onClick={onOpenCreateModal}>
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
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
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
                <span className={`role-pill ${roleClass[user.role] || 'role-client'}`}>{user.role}</span>
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
                <div className="row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    type="button" 
                    className="ghost-tool-button text-primary" 
                    title="View details"
                    onClick={() => onViewUser && onViewUser(user.id)}
                    style={{ padding: '6px 8px', minWidth: 'auto' }}
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    type="button" 
                    className="ghost-tool-button text-warning" 
                    title="Edit user"
                    onClick={() => onEditUser && onEditUser(user.id)}
                    style={{ padding: '6px 8px', minWidth: 'auto' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  {user.status === 'Suspended' ? (
                    <button 
                      type="button" 
                      className="ghost-tool-button text-success" 
                      title="Activate account"
                      onClick={() => onToggleBan && onToggleBan(user.id, true)}
                      style={{ padding: '6px 8px', minWidth: 'auto' }}
                    >
                      <ShieldCheck size={14} />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="ghost-tool-button text-danger" 
                      title="Deactivate (Ban)"
                      onClick={() => onToggleBan && onToggleBan(user.id, false)}
                      style={{ padding: '6px 8px', minWidth: 'auto' }}
                    >
                      <ShieldAlert size={14} />
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="ghost-tool-button text-danger" 
                    title="Delete user"
                    onClick={() => onDeleteUser && onDeleteUser(user.id)}
                    style={{ padding: '6px 8px', minWidth: 'auto' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <footer className="user-table-footer">
      <span>Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
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
}

export default UserManagementTable
