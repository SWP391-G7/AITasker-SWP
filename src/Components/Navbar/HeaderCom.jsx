import React, { useState, useEffect, useRef } from 'react'
import avatar from '../LandingPages/image/user_avatar.png'
import './HeaderCom.css'
import { Bell, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, logout, getStoredUser } from '../../Services/checkLogin'

export default function HeaderCom() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setIsLogin(isLoggedIn())
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsLogin(false)
    setShowDropdown(false)
    navigate('/login')
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

  const currentUser = getStoredUser();
  const currentUserName = currentUser?.fullName || "@"
  const avatarLetter = currentUserName.charAt(0).toUpperCase()
  return (
    <nav className="navbar navbar-expand-lg navbar-dark header-container py-0">
      <div className="container-fluid px-sm-5 h-100 d-flex align-items-center justify-content-between">
        <a className="logo-text navbar-brand fw-bold mb-0" href="#explore">
          AITasker
        </a>

        <button
          className="navbar-toggler border-0 focus-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center h-100" id="navbarNav">
          <ul className="navbar-nav gap-lg-4 mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <a className="nav-link active fw-semibold" href="#explore">Explore</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#experts">Experts</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold" href="#dashboard">Dashboard</a>
            </li>
          </ul>
        </div>

        <div className="d-flex align-items-center gap-3">
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
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="User Menu"
                >
                  {/* <img src={avatar} alt="User Profile" className="user-avatar" /> */}
                  <div className="avatar">{avatarLetter}</div>
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
          )
          }
        </div>
      </div>
    </nav>
  )
}
