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
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored || JSON.parse(stored).length === 0) {
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
  }
}

export const getLocalNotifications = () => {
  try {
    const reminder = checkProfileReminder()
    let local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
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
