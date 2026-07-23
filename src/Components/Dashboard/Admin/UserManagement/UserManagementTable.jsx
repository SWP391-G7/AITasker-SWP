import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
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

const roleFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'AI Expert', value: 'AI Expert' },
  { label: 'Client', value: 'Client' }
]
const statusFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Suspended', value: 'Suspended' }
]

const UserManagementTable = ({ 
  users = [], 
  searchQuery = '', 
  onViewUser, 
  onEditUser, 
  onDeleteUser, 
  onToggleBan,
  onOpenCreateModal
}) => {
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredUsers = (users || []).filter((user) => {
    if (!user) return false
    const query = (searchQuery || '').toLowerCase()
    const userName = (user.name || user.full_name || '').toLowerCase()
    const userEmail = (user.email || '').toLowerCase()
    const userRole = (user.role || '').toLowerCase()
    const userStatus = (user.status || user.acc_status || '').toString().toLowerCase()

    const matchesSearch = (
      userName.includes(query) ||
      userEmail.includes(query) ||
      userRole.includes(query) ||
      userStatus.includes(query)
    )
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const effectivePage = Math.min(currentPage, totalPages)
  const pageStart = (effectivePage - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(pageStart, pageStart + pageSize)
  const firstVisibleUser = filteredUsers.length === 0 ? 0 : pageStart + 1
  const lastVisibleUser = Math.min(pageStart + pageSize, filteredUsers.length)

  const changePage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  return (
  <section className="user-table-panel">
    <div className="user-table-toolbar">
      <div className="user-table-actions">
        <Dropdown autoClose="outside" className="user-filter-dropdown-wrap">
          <Dropdown.Toggle
            as="button"
            className="ghost-tool-button user-filter-toggle"
            id="user-management-filter"
            type="button"
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </Dropdown.Toggle>

          <Dropdown.Menu align="end" className="user-filter-dropdown">
            <Dropdown.Header>Role</Dropdown.Header>
            {roleFilterOptions.map((role) => (
              <Dropdown.Item
                as="button"
                className="user-filter-item"
                key={role.value}
                onClick={() => {
                  setRoleFilter(role.value)
                  setCurrentPage(1)
                }}
              >
                <input type="radio" checked={roleFilter === role.value} readOnly />
                <span>{role.label}</span>
              </Dropdown.Item>
            ))}
            <Dropdown.Divider />
            <Dropdown.Header>Status</Dropdown.Header>
            {statusFilterOptions.map((status) => (
              <Dropdown.Item
                as="button"
                className="user-filter-item"
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value)
                  setCurrentPage(1)
                }}
              >
                <input type="radio" checked={statusFilter === status.value} readOnly />
                <span>{status.label}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
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
          {paginatedUsers.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  {user.avatarUrl ? (
                    <img
                      className="user-avatar user-avatar-image"
                      src={user.avatarUrl}
                      alt={`${user.name} avatar`}
                    />
                  ) : (
                    <span className={`user-avatar avatar-${user.id}`}>{user.avatar}</span>
                  )}
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
                {user.role === 'Admin' ? (
                  <span className="text-muted small">-</span>
                ) : (
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
                    {/* <button 
                      type="button" 
                      className="ghost-tool-button text-danger" 
                      title="Delete user"
                      onClick={() => onDeleteUser && onDeleteUser(user.id)}
                      style={{ padding: '6px 8px', minWidth: 'auto' }}
                    >
                      <Trash2 size={14} />
                    </button> */}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <footer className="user-table-footer">
      <span>
        Showing {firstVisibleUser}-{lastVisibleUser} of {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          aria-label="Previous page"
          disabled={effectivePage === 1}
          onClick={() => changePage(effectivePage - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            type="button"
            className={page === effectivePage ? 'active' : ''}
            aria-label={`Page ${page}`}
            aria-current={page === effectivePage ? 'page' : undefined}
            key={page}
            onClick={() => changePage(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={effectivePage === totalPages}
          onClick={() => changePage(effectivePage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  </section>
  )
}

export default UserManagementTable
