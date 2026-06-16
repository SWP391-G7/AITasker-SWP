import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../Services/authService'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
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

      <main className="admin-main-panel expert-main-panel expert-messages-main">
        <header className="expert-messages-header">
          <div>
            <h1>Messages</h1>
            <p>Connect and collaborate with your clients in real-time.</p>
          </div>
        </header>

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
