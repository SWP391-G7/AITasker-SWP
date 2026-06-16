import React, { Component } from 'react'
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css"
import { getStoredUser } from '../../../../Services/checkLogin'

const currentUser = getStoredUser();
const avatarLetter = () => {
    const currentUser = getStoredUser()
    const currentUserName = currentUser?.fullName || "@"
    return (
      currentUserName.charAt(0).toUpperCase()
    )
  }
  const userAvatar = avatarLetter()

export default class Header extends Component {
  render() {
    return (
      <header className="messages-header">
          <div>
            <h1>Messages</h1>
            <p>Coordinate with experts and track project discussions in one place.</p>
          </div>

          <div className="messages-header-actions">
            <button>New Message</button>
            <span className="market-avatar">{userAvatar}</span>
          </div>
        </header>
    )
  }
}
