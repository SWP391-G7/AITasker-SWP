import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import AdminHeader from '../../../Components/Dashboard/Admin/AdminHeader'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import UserManagementStats from '../../../Components/Dashboard/Admin/UserManagement/UserManagementStats'
import UserManagementTable from '../../../Components/Dashboard/Admin/UserManagement/UserManagementTable'
import Footer from '../../../Components/Footer/Footer'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import {
  buildRealAdminUsers,
  deactivateAdminUser,
  deleteAdminUser,
  getAdminUsersData
} from '../../../Services/adminDashboardService'
import '../../../Components/Dashboard/Admin/UserManagement/UserManagement.css'
import '../../Style/AdminDashboardPage.css'

const UserManagementPage = ({ onLogout }) => {
  // React Router navigate helper is used for sidebar navigation and fallback logout redirect.
  const navigate = useNavigate()

  // Search text comes from AdminHeader and is applied inside UserManagementTable.
  const [searchQuery, setSearchQuery] = useState('')

  // Local notification count is kept from the existing admin header behavior.
  const [notifications, setNotifications] = useState(3)

  // users stores table-ready rows, not raw backend objects.
  const [users, setUsers] = useState([])

  // userError stores API/action failures so the page can show a simple alert.
  const [userError, setUserError] = useState('')

  // isLoadingUsers lets the table show a loading row while the real API is being called.
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const fetchUsers = async () => {
    try {
      // Mark the table as loading before calling the real admin users API.
      setIsLoadingUsers(true)

      // Clear old errors so a successful retry does not keep showing stale error text.
      setUserError('')

      // getAdminUsersData now calls GET /api/admin/users, not /api/search.
      const usersData = await getAdminUsersData()

      // Convert backend user objects into the exact row shape the table expects.
      setUsers(buildRealAdminUsers(usersData))
    } catch (err) {
      // Show the backend/client error message when available.
      setUserError(err.message || 'Failed to load users.')

      // Empty the table after a failed load to avoid showing stale admin data.
      setUsers([])
    } finally {
      // Always stop loading, whether the request succeeded or failed.
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    // Load real users when the admin management page first mounts.
    fetchUsers()
  }, [])

  const handleDeleteUser = async (user) => {
    // Delete is destructive, so the browser must confirm before calling the API.
    const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`)

    // Stop immediately when admin cancels the confirm dialog.
    if (!confirmed) return

    try {
      // Clear old action errors before attempting the delete.
      setUserError('')

      // Call DELETE /api/admin/users/:id through the shared service.
      await deleteAdminUser(user.id)

      // Remove the deleted user from the table without waiting for a full refetch.
      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== user.id))
    } catch (err) {
      // Surface delete failures, for example foreign-key conflict from backend.
      setUserError(err.response?.data?.message || err.message || 'Failed to delete user.')
    }
  }

  const handleDeactivateUser = async (user) => {
    // Ban/deactivate changes account status, so confirm before calling the API.
    const confirmed = window.confirm(`Deactivate ${user.name}? This user will be banned from using the account.`)

    // Stop immediately when admin cancels the confirm dialog.
    if (!confirmed) return

    try {
      // Clear old action errors before attempting the status update.
      setUserError('')

      // Call PUT /api/admin/users/:id/deactivate through the shared service.
      const data = await deactivateAdminUser(user.id)

      // Normalize the updated backend user and replace only the affected table row.
      const [updatedUser] = buildRealAdminUsers([data.user || { ...user, accStatus: false }])

      // Update the row in place so the UI immediately shows Suspended.
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === user.id ? updatedUser : item))
      )
    } catch (err) {
      // Surface deactivate failures from backend or network layer.
      setUserError(err.response?.data?.message || err.message || 'Failed to deactivate user.')
    }
  }

  const handleEditUser = (user) => {
    // Edit UI will be implemented later; this keeps the button wired to the selected row.
    console.log('Edit user clicked:', user)
  }

  const stats = useMemo(() => {
    // Count expert rows from the table-ready role label.
    const experts = users.filter((user) => user.role === 'AI Expert').length

    // Count client rows from the table-ready role label.
    const clients = users.filter((user) => user.role === 'Client').length

    // Count banned/deactivated users from the table status.
    const suspended = users.filter((user) => user.status === 'Suspended').length

    // Return the same stat-card structure the existing UserManagementStats component expects.
    return [
      { id: 'total-users', label: 'Total Users', value: users.length.toLocaleString(), trend: 'Real API', tone: 'blue' },
      { id: 'experts', label: 'AI Experts', value: experts.toLocaleString(), trend: 'Live', tone: 'teal' },
      { id: 'clients', label: 'Active Clients', value: clients.toLocaleString(), trend: 'Live', tone: 'slate' },
      { id: 'suspended', label: 'Suspended Users', value: suspended.toLocaleString(), trend: 'Manual Ban', tone: 'rose' },
    ]
  }, [users])

  const handleLogout = onLogout || (() => {
    // Remove auth token from browser storage on logout.
    localStorage.removeItem('token')

    // Remove saved email from browser storage on logout.
    localStorage.removeItem('email')

    // Navigate back to the public home page.
    navigate('/')
  })

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
          headerActions={
            <button type="button" className="btn-approve admin-header-action-button">
              <UserPlus size={16} />
              Invite User
            </button>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search users, roles, or status..."
          onLogout={handleLogout}
        />

        {userError && <div className="alert alert-danger">{userError}</div>}

        <UserManagementStats stats={stats} />

        <UserManagementTable
          users={users}
          searchQuery={searchQuery}
          isLoading={isLoadingUsers}
          onDeleteUser={handleDeleteUser}
          onDeactivateUser={handleDeactivateUser}
          onEditUser={handleEditUser}
        />

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default UserManagementPage
