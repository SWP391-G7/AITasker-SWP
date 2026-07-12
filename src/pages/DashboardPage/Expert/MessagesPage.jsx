import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ChatList from '../../../Components/Dashboard/Expert/Messages/ChatList'
import ChatWindow from '../../../Components/Dashboard/Expert/Messages/ChatWindow'
import { getConversations, getConversationMessages, sendMessage } from '../../../Services/messageService'
import { createHandleLogout } from './handleLogout'
import useWebSocket from '../../../hooks/useWebSocket'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/Messages/MessagesPage.css'

const MessagesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(0)

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = createHandleLogout(navigate)

  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  // 1. Fetch conversations list
  const fetchConvs = useCallback(async () => {
    try {
      const data = await getConversations()
      setConversations(data)
      return data
    } catch (err) {
      console.error("Error fetching conversations:", err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      const data = await fetchConvs()
      const passedId = location.state?.activeConversationId
      if (passedId) {
        setActiveChatId(passedId)
      } else if (data.length > 0) {
        setActiveChatId(data[0].id)
      }
    }
    init()
  }, [fetchConvs, location.state?.activeConversationId])

  // Periodic poll for conversation list
  useEffect(() => {
    const interval = setInterval(fetchConvs, 10000)
    return () => clearInterval(interval)
  }, [fetchConvs])

  // 2. Fetch messages for active conversation (only on change)
  useEffect(() => {
    if (!activeChatId) return

    const fetchMessages = async () => {
      try {
        const data = await getConversationMessages(activeChatId)
        setMessages(data)

        setConversations(prev => prev.map(c =>
          c.id === activeChatId ? { ...c, unread: 0 } : c
        ))
      } catch (err) {
        console.error("Error fetching messages:", err)
      }
    }

    fetchMessages()
  }, [activeChatId])

  // 3. Set up WebSocket listener
  useWebSocket((data) => {
    if (data.type === 'new_message') {
      const { conversationId, message } = data
      
      // If it belongs to active conversation, append it
      if (conversationId === activeChatId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev
          return [...prev, message]
        })

        // Also update last message preview in list
        setConversations(prev => prev.map(c =>
          c.id === conversationId
            ? { ...c, last_message: message.content, last_message_time: message.send_at, unread: 0 }
            : c
        ))
      } else {
        // Increment unread count for other conversation
        setConversations(prev => {
          const exists = prev.some(c => c.id === conversationId)
          if (!exists) {
            // Reload list to fetch new conversation if it's not present
            fetchConvs()
            return prev
          }
          return prev.map(c =>
            c.id === conversationId
              ? { ...c, last_message: message.content, last_message_time: message.send_at, unread: (c.unread || 0) + 1 }
              : c
          )
        })
      }
    }
  })

  // 4. Handle sending a message
  const handleSendMessage = async (text) => {
    if (!activeChatId || !text.trim()) return
    try {
      const newMsg = await sendMessage(activeChatId, text)
      setMessages(prev => [...prev, newMsg])

      setConversations(prev => prev.map(c =>
        c.id === activeChatId
          ? {
            ...c,
            last_message: text,
            last_message_time: new Date().toISOString()
          }
          : c
      ))
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  // Prepare UI conversations (renaming properties to match ChatList component expectations)
  const uiConversations = useMemo(() => {
    return conversations.map(c => {
      const name = c.other_user_name || "Direct Chat"
      const role = c.other_user_role === 'expert'
        ? (c.other_user_professional_title || "Expert")
        : (c.other_user_company_name || "Client")

      const avatarUrl = c.other_user_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`

      return {
        id: c.id,
        name: name,
        role: role,
        project: c.content || "Direct Chat",
        avatar: avatarUrl,
        lastMessage: c.last_message || "No messages yet",
        time: c.last_message_time
          ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "",
        unread: c.unread,
        status: 'online',
        milestone: 'General Conversation',
        progress: 100,
        nextPayment: 'N/A',
        sharedFiles: []
      }
    })
  }, [conversations])

  const activeConversation = uiConversations.find(c => c.id === activeChatId)

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="messages" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel messages-main">
        <ExpertHeader
          title="Messages"
          subtitle="Reply to client conversations after proposal approval."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        {loading ? (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "400px", color: "#64748b" }}>
            <p>Loading conversations...</p>
          </div>
        ) : (
          <section className="messages-layout-container">
            <ChatList
              conversations={uiConversations}
              activeId={activeChatId}
              onSelect={setActiveChatId}
              searchQuery={searchQuery}
            />
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </section>
        )}
      </main >
    </div >
  )
}

export default MessagesPage
