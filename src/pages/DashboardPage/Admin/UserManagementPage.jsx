import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, X, Loader2, Info, Trash2, ShieldAlert } from 'lucide-react'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import UserManagementStats from '../../../Components/Dashboard/Admin/UserManagement/UserManagementStats'
import UserManagementTable from '../../../Components/Dashboard/Admin/UserManagement/UserManagementTable'
import Footer from '../../../Components/Footer/Footer'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import {
  buildManagedUsers,
  getAdminUsersData,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminDeactivateUser
} from '../../../Services/adminDashboardService'
import '../../../Components/Dashboard/Admin/UserManagement/UserManagement.css'
import '../Style/AdminDashboardPage.css'

const UserManagementPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [users, setUsers] = useState([])
  const [userError, setUserError] = useState('')
  const [loading, setLoading] = useState(false)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteTargetUser, setDeleteTargetUser] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [deactivateTargetUser, setDeactivateTargetUser] = useState(null)
  const [deactivateError, setDeactivateError] = useState('')
  const [isDeactivating, setIsDeactivating] = useState(false)

  // Form states
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    role: 'client',
    password: ''
  })
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'client',
    acc_status: true
  })
  const [modalError, setModalError] = useState('')

  const fetchUsers = async () => {
    try {
      setUserError('')
      setLoading(true)
      const usersData = await getAdminUsersData()
      setUsers(buildManagedUsers(usersData))
    } catch (err) {
      setUserError(err.message || 'Failed to load users.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const stats = useMemo(() => {
    const experts = users.filter((user) => user.role === 'AI Expert').length
    const clients = users.filter((user) => user.role === 'Client').length
    const suspended = users.filter((user) => user.status === 'Suspended').length

    return [
      { id: 'total-users', label: 'Total Users', value: users.length.toLocaleString(), trend: 'Live catalog', tone: 'blue' },
      { id: 'experts', label: 'AI Experts', value: experts.toLocaleString(), trend: 'Live', tone: 'teal' },
      { id: 'clients', label: 'Active Clients', value: clients.toLocaleString(), trend: 'Live', tone: 'slate' },
      { id: 'suspended', label: 'Banned Users', value: suspended.toLocaleString(), trend: 'Suspended', tone: 'rose' },
    ]
  }, [users])

  const handleLogout = onLogout || (() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/')
  })

  // Action Handlers
  const handleOpenCreateModal = () => {
    setCreateForm({
      fullName: '',
      email: '',
      role: 'client',
      password: ''
    })
    setModalError('')
    setShowCreateModal(true)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      setModalError('')
      await adminCreateUser(createForm)
      setShowCreateModal(false)
      fetchUsers()
    } catch (err) {
      setModalError(err.message || 'Failed to create user')
    }
  }

  const handleOpenEditModal = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    // Map role back to db role format
    let dbRole = 'client'
    if (targetUser.role === 'AI Expert') dbRole = 'expert'
    else if (targetUser.role === 'Admin') dbRole = 'admin'

    setEditForm({
      fullName: targetUser.name,
      email: targetUser.email,
      role: dbRole,
      acc_status: targetUser.status !== 'Suspended'
    })
    setSelectedUser(targetUser)
    setModalError('')
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      setModalError('')
      await adminUpdateUser(selectedUser.id, editForm)
      setShowEditModal(false)
      fetchUsers()
    } catch (err) {
      setModalError(err.message || 'Failed to update user')
    }
  }

  const handleViewUser = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (targetUser) {
      setSelectedUser(targetUser)
      setShowViewModal(true)
    }
  }

  const handleViewProfile = (userId) => {
    setShowViewModal(false)
    navigate(`/profile/${userId}`)
  }

  const handleDeleteUser = async (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    setDeleteTargetUser(targetUser)
    setDeleteError('')
    setShowDeleteModal(true)
  }

  const handleCancelDelete = () => {
    if (isDeleting) return
    setShowDeleteModal(false)
    setDeleteTargetUser(null)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetUser) return

    try {
      setDeleteError('')
      setIsDeleting(true)
      await adminDeleteUser(deleteTargetUser.id)
      setShowDeleteModal(false)
      setDeleteTargetUser(null)
      fetchUsers()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleBan = async (userId, newStatus) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    if (!newStatus) {
      setDeactivateTargetUser(targetUser)
      setDeactivateError('')
      setShowDeactivateModal(true)
      return
    }

    try {
      await adminDeactivateUser(userId, newStatus)
      fetchUsers()
    } catch (err) {
      alert(err.message || 'Failed to update account ban status')
    }
  }

  const handleCancelDeactivate = () => {
    if (isDeactivating) return
    setShowDeactivateModal(false)
    setDeactivateTargetUser(null)
    setDeactivateError('')
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivateTargetUser) return

    try {
      setDeactivateError('')
      setIsDeactivating(true)
      await adminDeactivateUser(deactivateTargetUser.id, false)
      setShowDeactivateModal(false)
      setDeactivateTargetUser(null)
      fetchUsers()
    } catch (err) {
      setDeactivateError(err.message || 'Failed to deactivate account')
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar
        activeTab="users"
        onTabChange={(tabId) => handleAdminTabChange(tabId, navigate)}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel user-management-main">
        <AdminHeader
          title="User Management"
          subtitle="Monitor and manage access for all experts and clients."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search users, roles, or status..."
          onLogout={handleLogout}
        />
        {userError && <div className="alert alert-danger">{userError}</div>}
        {loading && <div className="alert alert-success">Refreshing user management data...</div>}
        
        <UserManagementStats stats={stats} />
        
        <UserManagementTable 
          users={users} 
          searchQuery={searchQuery}
          onViewUser={handleViewUser}
          onEditUser={handleOpenEditModal}
          onDeleteUser={handleDeleteUser}
          onToggleBan={handleToggleBan}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* ── View User Modal ────────────────────────────── */}
        {showViewModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)} style={modalOverlayStyle}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header" style={modalHeaderStyle}>
                <h3 className="fw-bold mb-0 text-white"><Info size={20} className="me-2 text-primary" />User Details</h3>
                <button onClick={() => setShowViewModal(false)} style={closeBtnStyle}><X size={20} /></button>
              </div>
              <div className="modal-body" style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <span className={`user-avatar avatar-${selectedUser.id}`} style={{ width: '60px', height: '60px', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontWeight: 'bold' }}>
                    {selectedUser.avatar}
                  </span>
                  <div>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{selectedUser.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>User ID: {selectedUser.id}</p>
                  </div>
                </div>

                <div style={detailRowStyle}>
                  <strong style={labelStyle}>EMAIL ADDRESS</strong>
                  <span style={valueStyle}>{selectedUser.email}</span>
                </div>
                <div style={detailRowStyle}>
                  <strong style={labelStyle}>SYSTEM ROLE</strong>
                  <span style={valueStyle}>{selectedUser.role}</span>
                </div>
                <div style={detailRowStyle}>
                  <strong style={labelStyle}>ACCOUNT STATUS</strong>
                  <span style={{ 
                    ...valueStyle, 
                    color: selectedUser.status === 'Suspended' ? '#ef4444' : '#10b981',
                    fontWeight: 'bold'
                  }}>
                    {selectedUser.status === 'Suspended' ? 'Suspended (Banned)' : 'Active'}
                  </span>
                </div>
                <div style={detailRowStyle}>
                  <strong style={labelStyle}>VERIFICATION STATUS</strong>
                  <span style={valueStyle}>{selectedUser.verified ? 'Verified Email' : 'Unverified'}</span>
                </div>
                <div style={detailRowStyle}>
                  <strong style={labelStyle}>CREATION DATE</strong>
                  <span style={valueStyle}>{selectedUser.joined}</span>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button
                  onClick={() => handleViewProfile(selectedUser.id)}
                  style={btnPrimaryStyle}
                >
                  View Profile
                </button>
                <button 
                  onClick={() => setShowViewModal(false)}
                  style={btnSecondaryStyle}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Create User Modal ────────────────────────────── */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)} style={modalOverlayStyle}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header" style={modalHeaderStyle}>
                <h3 className="fw-bold mb-0 text-white">Create New User</h3>
                <button onClick={() => setShowCreateModal(false)} style={closeBtnStyle}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateUser}>
                {modalError && <div className="alert alert-danger mb-3">{modalError}</div>}
                
                <div className="mb-3">
                  <label style={formLabelStyle}>FULL NAME</label>
                  <input 
                    type="text" 
                    required
                    style={formInputStyle} 
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="mb-3">
                  <label style={formLabelStyle}>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    required
                    style={formInputStyle} 
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    placeholder="e.g. user@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label style={formLabelStyle}>ROLE</label>
                  <select 
                    style={formInputStyle}
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  >
                    <option value="client">Client</option>
                    <option value="expert">AI Expert</option>
                    <option value="admin">Global Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label style={formLabelStyle}>TEMPORARY PASSWORD</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    style={formInputStyle} 
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'end' }}>
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={btnSecondaryStyle}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={btnPrimaryStyle}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit User Modal ────────────────────────────── */}
        {showEditModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)} style={modalOverlayStyle}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header" style={modalHeaderStyle}>
                <h3 className="fw-bold mb-0 text-white">Edit User Settings</h3>
                <button onClick={() => setShowEditModal(false)} style={closeBtnStyle}><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                {modalError && <div className="alert alert-danger mb-3">{modalError}</div>}
                
                <div className="mb-3">
                  <label style={formLabelStyle}>FULL NAME</label>
                  <input 
                    type="text" 
                    required
                    style={formInputStyle} 
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label style={formLabelStyle}>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    required
                    style={formInputStyle} 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label style={formLabelStyle}>ROLE</label>
                  <select 
                    style={formInputStyle}
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
                    <option value="client">Client</option>
                    <option value="expert">AI Expert</option>
                    <option value="admin">Global Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label style={formLabelStyle}>ACCOUNT STATUS</label>
                  <select 
                    style={formInputStyle}
                    value={editForm.acc_status ? "true" : "false"}
                    onChange={(e) => setEditForm({...editForm, acc_status: e.target.value === "true"})}
                  >
                    <option value="true">Active (Access Allowed)</option>
                    <option value="false">Suspended (Access Banned)</option>
                  </select>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'end' }}>
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={btnSecondaryStyle}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={btnPrimaryStyle}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && deleteTargetUser && (
          <div className="modal-overlay" onClick={handleCancelDelete} style={modalOverlayStyle}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header" style={modalHeaderStyle}>
                <h3 className="fw-bold mb-0 text-white">
                  <Trash2 size={20} className="me-2 text-danger" />
                  Delete User
                </h3>
                <button onClick={handleCancelDelete} style={closeBtnStyle} disabled={isDeleting}>
                  <X size={20} />
                </button>
              </div>

              {deleteError && <div className="alert alert-danger mb-3">{deleteError}</div>}

              <div style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.7' }}>
                <p style={{ marginBottom: '12px' }}>
                  Are you sure you want to permanently delete this user?
                </p>
                <div style={{ ...detailRowStyle, borderBottom: '1px solid rgba(248, 113, 113, 0.16)' }}>
                  <strong style={labelStyle}>USER</strong>
                  <span style={valueStyle}>{deleteTargetUser.name}</span>
                </div>
                <div style={detailRowStyle}>
                  <strong style={labelStyle}>EMAIL</strong>
                  <span style={valueStyle}>{deleteTargetUser.email}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  style={btnSecondaryStyle}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  style={btnDangerStyle}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="me-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeactivateModal && deactivateTargetUser && (
          <div className="modal-overlay" onClick={handleCancelDeactivate} style={modalOverlayStyle}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header" style={modalHeaderStyle}>
                <h3 className="fw-bold mb-0 text-white">
                  <ShieldAlert size={20} className="me-2 text-warning" />
                  Deactivate Account
                </h3>
                <button onClick={handleCancelDeactivate} style={closeBtnStyle} disabled={isDeactivating}>
                  <X size={20} />
                </button>
              </div>

              {deactivateError && <div className="alert alert-danger mb-3">{deactivateError}</div>}

              <div style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.7' }}>
                <p style={{ marginBottom: '12px' }}>
                  Are you sure you want to deactivate this account?
                </p>
                <div style={{ ...detailRowStyle, borderBottom: '1px solid rgba(251, 191, 36, 0.16)' }}>
                  <strong style={labelStyle}>USER</strong>
                  <span style={valueStyle}>{deactivateTargetUser.name}</span>
                </div>
                <div style={detailRowStyle}>
                  <strong style={labelStyle}>EMAIL</strong>
                  <span style={valueStyle}>{deactivateTargetUser.email}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button
                  type="button"
                  onClick={handleCancelDeactivate}
                  style={btnSecondaryStyle}
                  disabled={isDeactivating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  style={btnWarningStyle}
                  disabled={isDeactivating}
                >
                  {isDeactivating ? (
                    <>
                      <Loader2 size={16} className="me-2" />
                      Deactivating...
                    </>
                  ) : (
                    'Deactivate'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

// Inline Styles for Modals
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1100,
  padding: '20px'
}

const modalContentStyle = {
  background: '#0b1329',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '16px',
  padding: '28px',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
  animation: 'fadeIn 0.3s ease'
}

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
}

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'color 0.2s'
}

const formLabelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: '800',
  color: '#64748b',
  letterSpacing: '0.1em',
  marginBottom: '6px',
  textTransform: 'uppercase'
}

const formInputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s'
}

const btnPrimaryStyle = {
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '0.9rem',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
}

const btnSecondaryStyle = {
  background: 'transparent',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  color: '#94a3b8',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '0.9rem'
}

const btnDangerStyle = {
  alignItems: 'center',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: '0.9rem',
  fontWeight: '600',
  justifyContent: 'center',
  minWidth: '96px',
  padding: '10px 20px'
}

const btnWarningStyle = {
  alignItems: 'center',
  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: '0.9rem',
  fontWeight: '600',
  justifyContent: 'center',
  minWidth: '116px',
  padding: '10px 20px'
}

const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid rgba(148, 163, 184, 0.05)'
}

const labelStyle = {
  fontSize: '0.75rem',
  color: '#64748b',
  letterSpacing: '0.05em'
}

const valueStyle = {
  color: '#f8fafc',
  fontWeight: '500'
}

export default UserManagementPage

