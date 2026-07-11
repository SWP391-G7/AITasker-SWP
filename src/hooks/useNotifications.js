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
  getNotificationsAPI,
  markNotificationAsReadAPI,
  markAllNotificationsAsReadAPI,
  getMilestoneByIdAPI,
  getProposalByIdAPI,
} from "../Services/notificationService"
import { getStoredUser } from "../Services/checkLogin"
import useWebSocket from "./useWebSocket"

export default function useNotifications(isLogin) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [bellShake, setBellShake] = useState(false)
  const prevUnreadRef = useRef(0)
  const notificationRef = useRef(null)

  const loadNotifications = async () => {
    try {
      const local = getLocalNotifications()
      const conv = await getConversationNotifications()
      
      let dbNotifs = []
      if (isLogin) {
        try {
          const res = await getNotificationsAPI()
          if (res && res.success && Array.isArray(res.notifications)) {
            dbNotifs = res.notifications.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.message,
              type: n.type,
              read: n.is_read || false,
              createdAt: n.created_at,
              referenceId: n.reference_id,
              isDbNotification: true,
            }))
          }
        } catch (e) {
          console.error("Failed to fetch database notifications:", e)
        }
      }

      const all = [...local, ...conv, ...dbNotifs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setNotifications(all)
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  const handleBellClick = () => {
    setShowNotifications((prev) => {
      if (!prev) loadNotifications()
      return !prev
    })
  }

  const handleNotificationClick = async (navigate, notif) => {
    if (!notif.read) {
      if (notif.isDbNotification) {
        try {
          await markNotificationAsReadAPI(notif.id)
        } catch (e) {
          console.error("Failed to mark db notification as read:", e)
        }
      } else if (notif.type !== "message") {
        markLocalAsRead(notif.id)
      }
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    }
    setShowNotifications(false)

    if (notif.link) {
      navigate(notif.link)
      return
    }

    if (notif.isDbNotification) {
      const type = notif.type
      const refId = notif.referenceId

      if (!refId) {
        navigate('/')
        return
      }

      switch (type) {
        case 'new_project':
        case 'project_finished':
        case 'milestones_finished':
        case 'new_milestones':
          navigate(`/projects/${refId}`)
          break

        case 'milestone_submitted':
        case 'milestone_rejected':
        case 'milestone_approved':
          try {
            const res = await getMilestoneByIdAPI(refId)
            if (res.success && res.milestone) {
              navigate(`/projects/${res.milestone.project_id}`)
            } else {
              navigate('/')
            }
          } catch (err) {
            console.error("Failed to fetch milestone details for navigation:", err)
            navigate('/')
          }
          break

        case 'new_proposal':
          try {
            const res = await getProposalByIdAPI(refId)
            if (res.success && res.proposal) {
              navigate(`/client/projects/${res.proposal.job_id}`)
            } else {
              navigate('/')
            }
          } catch (err) {
            console.error("Failed to fetch proposal details for navigation:", err)
            navigate('/')
          }
          break

        case 'proposal_accepted':
          navigate(`/expert/proposal/${refId}`)
          break

        case 'counter_proposal':
          try {
            const res = await getProposalByIdAPI(refId)
            if (res.success && res.proposal) {
              const storedUser = getStoredUser()
              if (storedUser?.role === 'client') {
                navigate(`/client/projects/${res.proposal.job_id}`)
              } else {
                navigate(`/expert/proposal/${refId}`)
              }
            } else {
              navigate('/')
            }
          } catch (err) {
            console.error("Failed to fetch proposal details for navigation:", err)
            navigate('/')
          }
          break

        case 'new_service_request':
        case 'service_request_accepted':
        case 'counter_service_request':
          navigate(`/service-requests/${refId}`)
          break

        case 'invitation':
          navigate('/expert/dashboard')
          break

        default:
          navigate('/')
          break
      }
    }
  }

  const markAsRead = async (id, e) => {
    e.stopPropagation()
    const notif = notifications.find((n) => n.id === id)
    if (notif) {
      if (notif.isDbNotification) {
        try {
          await markNotificationAsReadAPI(id)
        } catch (err) {
          console.error("Failed to mark db notification as read:", err)
        }
      } else {
        markLocalAsRead(id)
      }
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    }
  }

  const clearNotifications = async () => {
    setNotifications([])
    clearAllLocalNotifications()
    try {
      if (isLogin) {
        await markAllNotificationsAsReadAPI()
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
    }
    setShowNotifications(false)
  }

  // Seed welcome notification once + load on mount
  useEffect(() => {
    if (isLogin) {
      seedWelcomeNotification()
      loadNotifications()
    }
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

  // Real-time notification broadcast via WebSocket
  useWebSocket((data) => {
    if (data.type === 'NOTIFICATION_RECEIVED') {
      const newNotif = data.payload
      if (!newNotif) return

      playNotificationSound()
      sendDesktopNotification(newNotif.title, newNotif.message)
      setBellShake(true)
      setTimeout(() => setBellShake(false), 1000)

      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev
        const mapped = {
          id: newNotif.id,
          title: newNotif.title,
          body: newNotif.message,
          type: newNotif.type,
          read: newNotif.is_read || false,
          createdAt: newNotif.created_at,
          referenceId: newNotif.reference_id,
          isDbNotification: true,
        }
        return [mapped, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      })
    }
  })

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

