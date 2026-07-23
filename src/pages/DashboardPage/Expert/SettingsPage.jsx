/**
 * Frontend module: pages/DashboardPage/Expert/SettingsPage.jsx
 *
 * Vai trò: Page Settings Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import { getUserProfile } from '../../../Services/profileService'
import { createHandleLogout } from './handleLogout'
import '../Style/AdminDashboardPage.css'
import '../Style/ExpertDashboardPage.css'

// React component “Settings Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const SettingsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)
  const [profileData, setProfileData] = useState(null)
  const [profileError, setProfileError] = useState('')

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = createHandleLogout(navigate)

  // Handler “handle tab change” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  useEffect(() => {
    // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch profile”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
    const fetchProfile = async () => {
      if (!user?.id) return

      try {
        setProfileError('')

        // API data: get current expert profile from GET /api/profile/:userId.
        const data = await getUserProfile(user.id)
        setProfileData(data)
      } catch (err) {
        setProfileError(err.message || 'Failed to load profile settings.')
      }
    }

    fetchProfile()
  }, [user?.id])

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="settings" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          title="Settings"
          subtitle="Manage account, notification, and security preferences."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="admin-panel-card">
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            {profileError ? (
              <p>{profileError}</p>
            ) : (
              <>
                <p>{profileData?.user?.fullName || user?.fullName || 'Expert User'}</p>
                <p>{profileData?.user?.email || user?.email || 'Email not available'}</p>
                <p>{profileData?.expertProfile?.professionalTitle || 'Professional title not specified'}</p>
                <p>{profileData?.expertProfile?.skills || 'Skills not specified'}</p>
              </>
            )}
          </div>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default SettingsPage

