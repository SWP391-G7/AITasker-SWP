import { getStoredUser } from "./checkLogin"
import { getConversations } from "./messageService"

const STORAGE_KEY = "localNotifications"

export const timeAgo = (dateStr) => {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch { /* ignore */ }
}

export const requestDesktopPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

export const sendDesktopNotification = (title, body) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/vite.svg" })
  }
}

export const getMessagesPathByRole = (role) => {
  const normalizedRole = String(role || "").toLowerCase()
  if (normalizedRole.includes("expert")) return "/expert/messages"
  return "/client/messages"
}

const checkProfileReminder = () => {
  const user = getStoredUser()
  if (!user) return null
  const incompletes = []
  if (!user.bio && !user.description) incompletes.push("bio")
  if (!user.avatar) incompletes.push("avatar")
  const dismissed = localStorage.getItem("profileReminderDismissed")
  if (incompletes.length > 0 && !dismissed) {
    return {
      id: "profile-reminder",
      title: "Complete your profile",
      body: `Add your ${incompletes.join(" and ")} to get more opportunities.`,
      type: "reminder",
      read: false,
      createdAt: new Date().toISOString(),
      link: `/profile/${user.id}`,
    }
  }
  return null
}

export const seedWelcomeNotification = () => {
  const seeded = localStorage.getItem("welcomeSeeded")
  if (!seeded) {
    const welcome = [{
      id: "welcome-1",
      title: "Welcome to AITasker!",
      body: "Explore experts and services to get started.",
      type: "welcome",
      read: false,
      createdAt: new Date().toISOString(),
      link: "/marketplace",
    }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome))
    localStorage.setItem("welcomeSeeded", "true")
  }
}

export const getLocalNotifications = () => {
  try {
    const reminder = checkProfileReminder()
    let local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    
    // Auto-delete read local notifications on next page load/fetch
    const unreadLocal = local.filter((n) => !n.read)
    if (unreadLocal.length !== local.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unreadLocal))
      local = unreadLocal
    }

    if (reminder) {
      const exists = local.some((n) => n.id === "profile-reminder")
      if (!exists) local.unshift(reminder)
    }
    return local
  } catch {
    return []
  }
}

export const getConversationNotifications = async () => {
  const storedUser = getStoredUser()
  const msgsPath = getMessagesPathByRole(storedUser?.role)
  try {
    const data = await getConversations()
    return (data || [])
      .filter((c) => Number(c.unread) > 0)
      .map((c) => ({
        id: c.id,
        title: `New message from ${c.full_name || c.name || "Unknown"}`,
        body: c.last_message?.substring(0, 80) || "No content",
        type: "message",
        read: false,
        createdAt: c.updated_at || new Date().toISOString(),
        link: msgsPath,
      }))
  } catch {
    return []
  }
}

export const markLocalAsRead = (id) => {
  if (id === "profile-reminder") {
    localStorage.setItem("profileReminderDismissed", "true")
  }
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    const updated = stored.map((n) => (n.id === id ? { ...n, read: true } : n))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

export const clearAllLocalNotifications = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const getNotificationsAPI = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch notifications')
    return result
  } catch (error) {
    console.error('Get notifications error:', error)
    throw error
  }
}

export const markNotificationAsReadAPI = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to mark notification as read')
    return result
  } catch (error) {
    console.error('Mark notification as read error:', error)
    throw error
  }
}

export const markAllNotificationsAsReadAPI = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to mark all notifications as read')
    return result
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    throw error
  }
}

export const getMilestoneByIdAPI = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/milestones/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch milestone')
    return result
  } catch (error) {
    console.error('Get milestone error:', error)
    throw error
  }
}

export const getProposalByIdAPI = async (id) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')
    const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.message || 'Failed to fetch proposal')
    return result
  } catch (error) {
    console.error('Get proposal error:', error)
    throw error
  }
}

