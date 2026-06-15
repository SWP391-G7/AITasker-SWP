import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, Mail } from "lucide-react"
import avatar from "../LandingPages/image/user_avatar.png"
import { getStoredUser, isLoggedIn, logout } from "../../Services/checkLogin"
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

  const requireLogin = () => {
    closeMenu()
    setShowDropdown(false)
    navigate("/login", {
      state: { message: "Please log in or create an account to use this feature." },
    })
  }

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
    if (storedUser && storedUser.id) {
      navigate(`${storedUser.role}/dashboard`)
    }

  }

  const handleProfile = () => {
    setShowDropdown(false)
    const storedUser = getStoredUser()
    if (storedUser && storedUser.id) {
      navigate(`/profile/${storedUser.id}`)
    }
  }

  const avatarLetter = () => {
    const currentUser = getStoredUser()
    const currentUserName = currentUser?.fullName || "@"
    return (
      currentUserName.charAt(0).toUpperCase()
    )
  }
  const userAvatar = avatarLetter()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark header-container py-0">
      <div className="container-fluid px-3 px-sm-5 d-flex flex-wrap align-items-center justify-content-between py-2 py-lg-0" style={{ minHeight: "72px" }}>
        <Link className="logo-text navbar-brand fw-bold mb-0" to="/" onClick={closeMenu}>
          AITasker
        </Link>

        <div className="d-flex align-items-center gap-2">
          {isLogin && (
            <div className="avatar-wrapper d-lg-none">
              <img src={avatar} alt="User Profile" className="user-avatar" style={{ width: "30px", height: "30px" }} />
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
              <a className="nav-link active fw-semibold" href="#explore" onClick={closeMenu}>Explore</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#experts" onClick={closeMenu}>Experts</a>
            </li>
            <li className="nav-item">
              <button className="nav-link fw-semibold nav-button-link" type="button" onClick={handleDashboard}>
                Dashboard
              </button>
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
                  {/* <img src={avatar} alt="User Profile" className="user-avatar" /> */}
                  <div className="avatar">{userAvatar}</div>
                </button>

                {showDropdown && (
                  <div className="avatar-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={handleProfile}
                    >
                      <i className="bi bi-person me-2"></i>My Profile
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={handleDashboard}
                    >
                      <i className="bi bi-speedometer2 me-2"></i>Dashboard
                    </button>
                    <hr className="dropdown-divider my-1" />
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light">Log in</Link>
              <Link to="/register" className="btn btn-light">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
