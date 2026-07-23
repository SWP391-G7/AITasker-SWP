/**
 * Frontend module: Components/Navbar/NotificationBell.jsx
 *
 * Vai trò: Component Notification Bell: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useNavigate } from "react-router-dom"
import { Bell, BellDot, Check, MessageCircle } from "lucide-react"
import { timeAgo } from "../../Services/notificationService"
import useNotifications from "../../hooks/useNotifications"
import "./NotificationBell.css"

// React component “Notification Bell” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
export default function NotificationBell({ isLogin, isMobile }) {
  const navigate = useNavigate()
  const {
    showNotifications,
    notifications,
    unreadCount,
    bellShake,
    notificationRef,
    handleBellClick,
    handleNotificationClick,
    markAsRead,
    clearNotifications,
  } = useNotifications(isLogin)

  if (!isLogin) return null

  if (isMobile) {
    return (
      <button
        className={`icon-button position-relative ${bellShake ? "bell-shake" : ""}`}
        aria-label="Notifications"
        onClick={handleBellClick}
      >
        {unreadCount > 0 ? <BellDot size={20} /> : <Bell size={20} />}
        {unreadCount > 0 && <span className="icon-badge"></span>}
      </button>
    )
  }

  return (
    <div className="position-relative" ref={notificationRef}>
      <button
        className={`icon-button position-relative ${bellShake ? "bell-shake" : ""}`}
        aria-label="Notifications"
        onClick={handleBellClick}
      >
        {unreadCount > 0 ? <BellDot size={20} /> : <Bell size={20} />}
        {unreadCount > 0 && (
          <span className="message-count-badge" style={{ fontSize: "0.6rem", minWidth: "16px", height: "16px", top: "-5px", right: "-5px" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span className="notification-header-title">Notifications</span>
            {notifications.length > 0 && (
              <button className="notification-clear-btn" onClick={clearNotifications}>Clear all</button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${!notif.read ? "unread" : ""}`}>
                  <div className="notification-item-main" onClick={() => handleNotificationClick(navigate, notif)}>
                    <div className="notification-icon">
                      {notif.type === "message" ? <MessageCircle size={16} /> : <Bell size={16} />}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-body">{notif.body}</div>
                      <div className="notification-time">{timeAgo(notif.createdAt)}</div>
                    </div>
                    {!notif.read && <span className="notification-dot"></span>}
                  </div>
                  {!notif.read && (
                    <button className="notification-mark-read" onClick={(e) => markAsRead(notif.id, e)} title="Mark as read">
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
