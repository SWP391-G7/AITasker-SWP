import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, NavLink } from "react-router-dom"
import { Bell, LayoutDashboard, LogOut, Mail, Settings, User, RefreshCw } from "lucide-react"
import { getStoredUser, isLoggedIn, logout } from "../../Services/checkLogin"
import { switchRole } from "../../Services/authService"
import { updateUserRole } from "../../Services/onboardingService"
import SettingPage from "../../pages/SettingPage"
import ExpertOnboardingForm from "../onboarding/ExpertOnboardingForm"
import "./HeaderCom.css"

// ROLE ROUTING: Map role trong localStorage.user sang dashboard tương ứng.
const getDashboardPathByRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase()

  if (normalizedRole.includes("admin")) {
    return "/admin-dashboard"
  }

  if (normalizedRole.includes("expert")) {
    return "/expert/dashboard"
  }

  return "/client/dashboard"
}

export default function HeaderCom() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(() => isLoggedIn())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    logout()
    setIsLogin(false)
    setShowDropdown(false)
    closeMenu()
    navigate("/login")
  }

  const handleDashboard = () => {
    setShowDropdown(false)
    const storedUser = getStoredUser()
    navigate(getDashboardPathByRole(storedUser?.role))
  }

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

  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showExpertOnboarding, setShowExpertOnboarding] = useState(false)

  const handleSwitchRole = async () => {
    setShowDropdown(false)
    try {
      const result = await switchRole()
      if (result.success) {
        if (result.roleSwitched) {
          localStorage.setItem('token', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
          navigate(getDashboardPathByRole(result.user.role))
          window.location.reload()
        } else {
          setShowVerificationModal(true)
        }
      }
    } catch (err) {
      console.error("Switch role failed:", err)
      alert(err.message || "Failed to switch role.")
    }
  }

  const handleBecomeExpert = async () => {
    setShowVerificationModal(false)
    try {
      // Update user role to expert and set is_expert = true in database
      const result = await updateUserRole('expert')
      if (result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
      }
      // Show the expert onboarding form as a modal
      setShowExpertOnboarding(true)
    } catch (err) {
      console.error("Become expert failed:", err)
      alert(err.message || "Failed to update role to expert.")
    }
  }

  const handleExpertOnboardingBack = () => {
    setShowExpertOnboarding(false)
  }

  const currentUser = getStoredUser()
  const currentRole = String(currentUser?.role || "").toLowerCase().includes("expert") ? "Expert" : "Client"

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
              <div className="avatar-wrapper d-lg-none">
                <div className="avatar">{userAvatar}</div>
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
                  <button className="icon-button position-relative" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="icon-badge"></span>
                  </button>
                  <button className="icon-button" aria-label="Messages">
                    <Mail size={20} />
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
                <button className="icon-button position-relative" aria-label="Notifications">
                  <Bell size={20} />
                  <span className="icon-badge"></span>
                </button>

                <button className="icon-button" aria-label="Messages">
                  <Mail size={20} />
                </button>

                <div className="avatar-wrapper position-relative" ref={dropdownRef}>
                  <button
                    className="avatar-button"
                    onClick={() => setShowDropdown((value) => !value)}
                    aria-label="User Menu"
                  >
                    {/* Avatar uses the first letter when no profile image exists. */}
                    <div className="avatar">{userAvatar}</div>
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
                        onClick={handleSwitchRole}
                      >
                        <RefreshCw size={16} />
                        <span>Switch Role</span>
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
        onSwitchRole={handleSwitchRole}
      />

      {showVerificationModal && (
        <div className="verification-modal-backdrop">
          <div className="verification-modal-card">
            <h3 className="modal-title">Become an AI Expert</h3>
            <p className="modal-text">You are not verified to be an AI Expert. Do you want to become an AI Expert?</p>
            <div className="verification-modal-actions">
              <button
                className="btn-yes"
                onClick={handleBecomeExpert}
              >
                Yes
              </button>
              <button
                className="btn-no"
                onClick={() => setShowVerificationModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpertOnboarding && (
        <div className="expert-onboarding-modal-backdrop">
          <div className="expert-onboarding-modal-content">
            <ExpertOnboardingForm onBack={handleExpertOnboardingBack} />
          </div>
        </div>
      )}
    </>
  )
}
