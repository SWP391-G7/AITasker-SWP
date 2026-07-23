/**
 * Frontend module: Components/Dashboard/Client/Messages/Header.jsx
 *
 * Vai trò: Component Header: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Component } from 'react'
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css"
import { getStoredUser } from '../../../../Services/checkLogin'

export default class Header extends Component {
  render() {
    const currentUser = getStoredUser()
    const currentUserName = currentUser?.fullName || currentUser?.name || "@"
    const userAvatar = currentUserName.charAt(0).toUpperCase()

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
