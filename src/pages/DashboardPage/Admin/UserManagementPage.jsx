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
  buildManagedUsers,
  getAdminUsersData
} from '../../../Services/adminDashboardService'
import '../../../Components/Dashboard/Admin/UserManagement/UserManagement.css'
import '../../Style/AdminDashboardPage.css'

const UserManagementPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [users, setUsers] = useState([])
  const [userError, setUserError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUserError('')

        // API data: user management chỉ cần expert + client từ GET /api/search.
        const usersData = await getAdminUsersData()
        setUsers(buildManagedUsers(usersData))
      } catch (err) {
        setUserError(err.message || 'Failed to load users.')
        setUsers([])
      }
    }

    fetchUsers()
  }, [])

  const stats = useMemo(() => {
    const experts = users.filter((user) => user.role === 'AI Expert').length
    const clients = users.filter((user) => user.role === 'Client').length
    const pending = users.filter((user) => user.status === 'Pending').length

    return [
      { id: 'total-users', label: 'Total Users', value: users.length.toLocaleString(), trend: 'From API', tone: 'blue' },
      { id: 'experts', label: 'AI Experts', value: experts.toLocaleString(), trend: 'Live', tone: 'teal' },
      { id: 'clients', label: 'Active Clients', value: clients.toLocaleString(), trend: 'Live', tone: 'slate' },
      { id: 'pending', label: 'Pending Verification', value: pending.toLocaleString(), trend: 'Requires Action', tone: 'rose' },
    ]
  }, [users])

  const handleLogout = onLogout || (() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
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
        <UserManagementTable users={users} searchQuery={searchQuery} />
        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default UserManagementPage
