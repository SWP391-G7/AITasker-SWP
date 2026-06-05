import React, { Component } from 'react'
import avatar from '../LandingPages/image/user_avatar.png'
import './HeaderCom.css'
import { Bell, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { checkLogin } from '../../Services/checkLogin'

export default class HeaderCom extends Component {

  state = {
    isLogin: checkLogin(),
    isMenuOpen: false
  }

  toggleMenu = () => {
    this.setState({ isMenuOpen: !this.state.isMenuOpen })
  }

  closeMenu = () => {
    this.setState({ isMenuOpen: false })
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark header-container py-0">
        <div className="container-fluid px-3 px-sm-5 d-flex flex-wrap align-items-center justify-content-between py-2 py-lg-0" style={{ minHeight: '72px' }}>
          <a className="logo-text navbar-brand fw-bold mb-0" href="#explore">
            AITasker
          </a>

          <div className="d-flex align-items-center gap-2">
            {this.state.isLogin && (
              <div className="avatar-wrapper d-lg-none">
                <img src={avatar} alt="User Profile" className="user-avatar" style={{ width: '30px', height: '30px' }} />
              </div>
            )}

            <button
              className="navbar-toggler border-0 focus-none"
              type="button"
              onClick={this.toggleMenu}
              aria-controls="navbarNav"
              aria-expanded={this.state.isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className={`collapse navbar-collapse justify-content-center ${this.state.isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav gap-lg-4 mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <a className="nav-link active fw-semibold" href="#explore" onClick={this.closeMenu}>Explore</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-semibold" href="#experts" onClick={this.closeMenu}>Experts</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/dashboard" onClick={this.closeMenu}>Dashboard</Link>
              </li>
            </ul>

            {/* Mobile Auth / Utility */}
            <div className="d-flex d-lg-none flex-column align-items-center gap-3 w-100 mt-3 pt-3 border-top border-secondary-subtle">
              {this.state.isLogin ? (
                <div className="d-flex align-items-center justify-content-center gap-4 py-2">
                  <button className="icon-button position-relative" aria-label="Notifications" onClick={this.closeMenu}>
                    <Bell size={20} />
                    <span className="icon-badge"></span>
                  </button>

                  <button className="icon-button" aria-label="Messages" onClick={this.closeMenu}>
                    <Mail size={20} />
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column w-100 gap-2">
                  <Link to="/login" className="btn btn-outline-light w-100" onClick={this.closeMenu}>Log in</Link>
                  <Link to="/register" className="btn btn-light w-100" onClick={this.closeMenu}>Sign up</Link>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth / Utility */}
          <div className="d-none d-lg-flex align-items-center gap-3">
            {this.state.isLogin ? (
              <>
                <button className="icon-button position-relative" aria-label="Notifications">
                  <Bell size={20} />
                  <span className="icon-badge"></span>
                </button>

                <button className="icon-button" aria-label="Messages">
                  <Mail size={20} />
                </button>

                <div className="avatar-wrapper">
                  <img src={avatar} alt="User Profile" className="user-avatar" />
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
}
