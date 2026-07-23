/**
 * Frontend module: Components/Navbar/HeaderCom.jsx
 *
 * Vai trò: Component Header Com: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, NavLink } from "react-router-dom"
import { LayoutDashboard, LogOut, Mail, Settings, User } from "lucide-react"
import { getStoredUser, isLoggedIn, logout } from "../../Services/checkLogin"
import { getConversations } from "../../Services/messageService"
import SettingPage from "../Settings/SettingsPage"
import NotificationBell from "./NotificationBell"
import "./HeaderCom.css"

// ROLE ROUTING: Map role trong localStorage.user sang dashboard tương ứng.
const getDashboardPathByRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase()

  if (normalizedRole.includes("admin")) {
    return "/admin/dashboard"
  }

  if (normalizedRole.includes("expert")) {
    return "/expert/dashboard"
  }

  return "/client/dashboard"
}

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get messages path by role”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getMessagesPathByRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase()

  if (normalizedRole.includes("expert")) {
    return "/expert/messages"
  }

  return "/client/messages"
}

// React component “Header Com” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
export default function HeaderCom() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(() => isLoggedIn())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Handler “handle click outside” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isLogin) {
      setPendingMessages(0)
      return undefined
    }

    let isMounted = true

    // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch pending messages”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
    const fetchPendingMessages = async () => {
      try {
        const data = await getConversations()
        if (!isMounted) return
        const unreadConversations = data.filter((conversation) => Number(conversation.unread) > 0).length
        setPendingMessages(unreadConversations)
      } catch {
        if (isMounted) setPendingMessages(0)
      }
    }

    fetchPendingMessages()
    const interval = setInterval(fetchPendingMessages, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isLogin])

  // Handler “close menu” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const closeMenu = () => setIsMenuOpen(false)

  // Handler “handle logout” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleLogout = () => {
    logout()
    setIsLogin(false)
    setShowDropdown(false)
    closeMenu()
    navigate("/login")
  }

  // Handler “handle dashboard” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleDashboard = () => {
    setShowDropdown(false)
    const storedUser = getStoredUser()
    navigate(getDashboardPathByRole(storedUser?.role))
  }

  // Handler “handle messages” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleMessages = () => {
    const storedUser = getStoredUser()
    closeMenu()
    navigate(getMessagesPathByRole(storedUser?.role))
  }

  // Handler “handle profile” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleProfile = () => {
    setShowDropdown(false)
    const storedUser = getStoredUser()
    if (storedUser && storedUser.id) {
      navigate(`/profile/${storedUser.id}`)
    }
  }

  // Open the shared settings modal from the public navbar avatar menu.
  const handleSettings = () => {
    setShowDropdown(false)
    setIsSettingsOpen(true)
  }

  const currentUser = getStoredUser()
  const currentRole = String(currentUser?.role || "").toLowerCase().includes("expert") ? "Expert" : "Client"

  // Thực hiện phần logic “avatar letter” trong phạm vi trách nhiệm của module hiện tại.
  const avatarLetter = () => {
    const currentUserName = currentUser?.fullName || currentUser?.name || "User"
    return currentUserName.trim().charAt(0).toUpperCase() || "U"
  }
  const userAvatar = avatarLetter()
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark header-container py-0">
        <div className="container-fluid px-3 px-sm-5 d-flex flex-wrap align-items-center justify-content-between py-2 py-lg-0" style={{ minHeight: "72px" }}>
          <Link className="logo-text navbar-brand fw-bold mb-0" to="/" onClick={closeMenu}>
            AITasker
          </Link>

          <div className="d-flex align-items-center gap-2">
            {isLogin && (
              <div className="avatar-wrapper d-lg-none" onClick={handleProfile} style={{ cursor: "pointer" }}>
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="avatar" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div className="avatar">{userAvatar}</div>
                )}
              </div>
            )}

            <button
              className="navbar-toggler border-0 focus-none"
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              aria-controls="navbarNav"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className={`collapse navbar-collapse justify-content-center ${isMenuOpen ? "show" : ""}`} id="navbarNav">
            <ul className="navbar-nav gap-lg-4 mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link fw-semibold ${isActive ? "active" : ""}`} to="/" onClick={closeMenu}>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link fw-semibold ${isActive ? "active" : ""}`} to="/marketplace" onClick={closeMenu}>Marketplace</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link fw-semibold ${isActive ? "active" : ""}`} to="/clients-experts" onClick={closeMenu}>Client & Expert</NavLink>
              </li>
            </ul>

            <div className="d-flex d-lg-none flex-column align-items-center gap-3 w-100 mt-3 pt-3 border-top border-secondary-subtle">
              {isLogin ? (
                <div className="d-flex align-items-center justify-content-center gap-4 py-2">
                  <NotificationBell isLogin={isLogin} isMobile />
                  <button
                    className="icon-button position-relative"
                    aria-label={`${pendingMessages} unread message conversations`}
                    onClick={handleMessages}
                  >
                    <Mail size={20} />
                    {pendingMessages > 0 && (
                      <span className="message-count-badge">{pendingMessages > 9 ? "9+" : pendingMessages}</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column w-100 gap-2">
                  <Link to="/login" className="btn btn-outline-light w-100" onClick={closeMenu}>Log in</Link>
                  <Link to="/register" className="btn btn-light w-100" onClick={closeMenu}>Sign up</Link>
                </div>
              )}
            </div>
          </div>

          <div className="d-none d-lg-flex align-items-center gap-3">
            {isLogin ? (
              <>
                <NotificationBell isLogin={isLogin} />

                <button
                  className="icon-button position-relative"
                  aria-label={`${pendingMessages} unread message conversations`}
                  onClick={handleMessages}
                >
                  <Mail size={20} />
                  {pendingMessages > 0 && (
                    <span className="message-count-badge">{pendingMessages > 9 ? "9+" : pendingMessages}</span>
                  )}
                </button>

                <div className="avatar-wrapper position-relative" ref={dropdownRef}>
                  <button
                    className="avatar-button"
                    onClick={() => setShowDropdown((value) => !value)}
                    aria-label="User Menu"
                  >
                    {/* Avatar uses the image when exists, otherwise first letter. */}
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="avatar" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div className="avatar">{userAvatar}</div>
                    )}
                  </button>

                  {showDropdown && (
                    <div className="avatar-dropdown">
                      <button
                        className="dropdown-item"
                        onClick={handleProfile}
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={handleDashboard}
                      >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={handleSettings}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                      <hr className="dropdown-divider my-1" />
                      <button
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>Log out</span>
                      </button>
                    </div>
                  )
                  }
                </div >
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light">Log in</Link>
                <Link to="/register" className="btn btn-light">Sign up</Link>
              </>
            )}
          </div >
        </div >
      </nav >

      <SettingPage
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        role={currentRole}
        onLogout={handleLogout}
        onSwitchRole={handleDashboard}
      />
    </>
  )
}
