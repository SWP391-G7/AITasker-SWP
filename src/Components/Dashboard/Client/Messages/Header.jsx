import React, { Component } from 'react'
import "../../../../pages/MarketplacePage/Client/ClientMarketplace.css"

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
            <span className="market-avatar">A</span>
          </div>
        </header>
    )
  }
}
