import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertDashboardFooter from '../../../Components/Dashboard/Expert/ExpertDashboardFooter'
import ChatList from '../../../Components/Dashboard/Expert/Messages/ChatList'
import ChatWindow from '../../../Components/Dashboard/Expert/Messages/ChatWindow'
import { conversations } from '../../../Components/Dashboard/Expert/Messages/messagesData'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../../../Components/Dashboard/Expert/Messages/MessagesPage.css'

const MessagesPage = () => {
  const navigate = useNavigate()
  const [activeChatId, setActiveChatId] = useState(conversations[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(2)

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleTabChange = (id) => {
    if (id === 'dashboard') navigate('/expert/dashboard')
    else navigate(`/expert/${id}`)
  }

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeChatId), 
  [activeChatId])

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="messages" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel">
        <ExpertHeader
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="expert-content-container">
          <div className="page-title-section" style={{ paddingLeft: '1.5rem' }}>
            <div>
              <h1>Messages</h1>
              <p>Connect and collaborate with your clients in real-time.</p>
            </div>
          </div>

          <div className="messages-layout-container">
            <ChatList 
              conversations={conversations} 
              activeId={activeChatId} 
              onSelect={setActiveChatId} 
            />
            <ChatWindow conversation={activeConversation} />
          </div>
        </div>

        <ExpertDashboardFooter />
      </main>
    </div>
  )
}

export default MessagesPage
