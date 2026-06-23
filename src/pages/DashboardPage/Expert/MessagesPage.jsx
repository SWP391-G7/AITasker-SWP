import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ChatList from '../../../Components/Dashboard/Expert/Messages/ChatList'
import ChatWindow from '../../../Components/Dashboard/Expert/Messages/ChatWindow'
import ProjectOverviewSidebar from '../../../Components/Dashboard/Expert/Messages/ProjectOverviewSidebar'
import { conversations } from '../../../Components/Dashboard/Expert/Messages/messagesData'
import { createHandleLogout } from './handleLogout'
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

  const handleLogout = createHandleLogout(navigate)

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

      <main className="admin-main-panel expert-main-panel expert-messages-main">
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

        <section className="messages-layout-container">
          <ChatList
            conversations={conversations}
            activeId={activeChatId}
            onSelect={setActiveChatId}
          />
          <ChatWindow conversation={activeConversation} />
          <ProjectOverviewSidebar conversation={activeConversation} />
        </section>
      </main>
    </div>
  )
}

export default MessagesPage
