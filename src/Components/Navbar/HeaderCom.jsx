import React, { Component } from 'react'
import avatar from '../LandingPages/image/user_avatar.png'
import './HeaderCom.css'
import { Bell, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { checkLogin } from '../../Services/checkLogin'

export default class HeaderCom extends Component {

  state = {
    isLogin: checkLogin()
  }

  render() {
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
            )
            }
          </div>
        </div>
      </nav>
    )
  }
}
