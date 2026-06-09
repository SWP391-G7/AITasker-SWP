import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../../Components/Dashboard/Admin/AdminSidebar'
import UserManagementFooter from '../../../Components/Dashboard/Admin/UserManagement/UserManagementFooter'
import UserManagementHeader from '../../../Components/Dashboard/Admin/UserManagement/UserManagementHeader'
import UserManagementStats from '../../../Components/Dashboard/Admin/UserManagement/UserManagementStats'
import UserManagementTable from '../../../Components/Dashboard/Admin/UserManagement/UserManagementTable'
import { handleAdminTabChange } from '../../../Components/Dashboard/Admin/adminNavigation'
import '../../../Components/Dashboard/Admin/UserManagement/UserManagement.css'
import '../../Style/AdminDashboardPage.css'

const UserManagementPage = ({ onLogout }) => {
  const navigate = useNavigate()

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
        <UserManagementHeader />
        <UserManagementStats />
        <UserManagementTable />
        <UserManagementFooter />
      </main>
    </div>
  )
}

export default UserManagementPage
