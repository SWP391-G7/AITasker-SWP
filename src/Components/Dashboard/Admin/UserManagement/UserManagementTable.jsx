import { BadgeCheck, ChevronLeft, ChevronRight, Pencil, SlidersHorizontal, Trash2, UserPlus } from 'lucide-react'

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
  // users are already normalized by buildRealAdminUsers in the service layer.
  users = [],

  // searchQuery is owned by AdminHeader and passed down through UserManagementPage.
  searchQuery = '',

  // isLoading controls the temporary loading table row.
  isLoading = false,

  // onDeleteUser calls the real DELETE admin API after page-level confirmation.
  onDeleteUser,

  // onDeactivateUser calls the real deactivate/ban admin API after page-level confirmation.
  onDeactivateUser,

  // onEditUser is wired now; the edit feature can be implemented later.
  onEditUser
}) => {
  // Always convert unknown values to strings before searching/rendering.
  // This prevents the page from crashing if one backend row misses a field.
  const toSearchText = (value) => String(value || '').toLowerCase()

  // Normalize the search text once so every row compares against the same lowercase query.
  const query = toSearchText(searchQuery)

  // Filter client-side for the visible table rows.
  const filteredUsers = users.filter((user) => (
    toSearchText(user.name).includes(query) ||
    toSearchText(user.email).includes(query) ||
    toSearchText(user.role).includes(query) ||
    toSearchText(user.status).includes(query)
  ))

  return (
  <section className="user-table-panel">
    <div className="user-table-toolbar">
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
          {isLoading && (
            <tr>
              <td colSpan={6}>
                <span className="quiet-action">Loading users...</span>
              </td>
            </tr>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <tr>
              <td colSpan={6}>
                <span className="quiet-action">No users found.</span>
              </td>
            </tr>
          )}

          {!isLoading && filteredUsers.map((user) => (
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
                <span className={`role-pill ${roleClass[user.role] || ''}`}>{user.role}</span>
              </td>
              <td>
                <span className={`status-pill ${statusClass[user.status] || ''}`}>{user.status}</span>
              </td>
              <td>
                <span className={`verified-indicator ${user.verified ? 'is-verified' : ''}`}>
                  <BadgeCheck size={16} />
                </span>
              </td>
              <td>{user.joined}</td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-row-action"
                    title="Edit user"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => onEditUser?.(user)}
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    className="deactivate-mini"
                    disabled={user.status === 'Suspended'}
                    title={user.status === 'Suspended' ? 'User is already banned' : 'Deactivate user'}
                    onClick={() => onDeactivateUser?.(user)}
                  >
                    Ban
                  </button>

                  <button
                    type="button"
                    className="icon-row-action danger"
                    title="Delete user"
                    aria-label={`Delete ${user.name}`}
                    onClick={() => onDeleteUser?.(user)}
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
