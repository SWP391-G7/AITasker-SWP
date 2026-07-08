import { useEffect, useRef, useState } from "react"
import {
  seedWelcomeNotification,
  getLocalNotifications,
  getConversationNotifications,
  markLocalAsRead,
  clearAllLocalNotifications,
  playNotificationSound,
  requestDesktopPermission,
  sendDesktopNotification,
} from "../Services/notificationService"

export default function useNotifications(isLogin) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [bellShake, setBellShake] = useState(false)
  const prevUnreadRef = useRef(0)
  const notificationRef = useRef(null)

  // Seed welcome notification once
  useEffect(() => {
    if (isLogin) seedWelcomeNotification()
  }, [isLogin])

  // Poll messages for sound/desktop triggers
  useEffect(() => {
    if (!isLogin) return
    let isMounted = true
    const fetchPending = async () => {
      try {
        const convNotifs = await getConversationNotifications()
        if (!isMounted) return
        const unread = convNotifs.length
        const prev = prevUnreadRef.current
        prevUnreadRef.current = unread
        if (unread > prev && prev > 0) {
          playNotificationSound()
          sendDesktopNotification("New message", `You have ${unread} unread conversation${unread > 1 ? "s" : ""}`)
          setBellShake(true)
          setTimeout(() => setBellShake(false), 1000)
        }
      } catch {
        if (isMounted) prevUnreadRef.current = 0
      }
    }
    requestDesktopPermission()
    fetchPending()
    const interval = setInterval(fetchPending, 10000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isLogin])

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    const local = getLocalNotifications()
    const conv = await getConversationNotifications()
    const all = [...local, ...conv]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setNotifications(all)
  }

  const handleBellClick = () => {
    setShowNotifications((prev) => {
      if (!prev) loadNotifications()
      return !prev
    })
  }

  const handleNotificationClick = (navigate, notif) => {
    if (!notif.read) {
      if (notif.type !== "message" || false) markLocalAsRead(notif.id)
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    }
    setShowNotifications(false)
    if (notif.link) navigate(notif.link)
  }

  const markAsRead = (id, e) => {
    e.stopPropagation()
    markLocalAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearNotifications = () => {
    setNotifications([])
    clearAllLocalNotifications()
    setShowNotifications(false)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    showNotifications,
    notifications,
    unreadCount,
    bellShake,
    notificationRef,
    handleBellClick,
    handleNotificationClick,
    markAsRead,
    clearNotifications,
  }
}
