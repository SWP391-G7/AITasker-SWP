import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import Footer from '../../../Components/Footer/Footer'
import ChatList from '../../../Components/Dashboard/Expert/Messages/ChatList'
import ChatWindow from '../../../Components/Dashboard/Expert/Messages/ChatWindow'
import ProjectOverviewSidebar from '../../../Components/Dashboard/Expert/Messages/ProjectOverviewSidebar'
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

      <main className="admin-main-panel expert-main-panel expert-messages-main d-flex flex-column" style={{ minHeight: '100vh' }}>
        <ExpertHeader
          title="Messages"
          subtitle="Connect and collaborate with your clients in real-time."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="messages-layout-container flex-grow-1 mb-4">
          <ChatList
            conversations={conversations}
            activeId={activeChatId}
            onSelect={setActiveChatId}
          />
          <ChatWindow conversation={activeConversation} />
          <ProjectOverviewSidebar conversation={activeConversation} />
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  )
}

export default MessagesPage
