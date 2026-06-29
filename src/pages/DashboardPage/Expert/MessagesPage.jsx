import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ExpertHeader from '../../../Components/Dashboard/Expert/ExpertHeader'
import ExpertSidebar from '../../../Components/Dashboard/Expert/ExpertSidebar'
import ConversationPanel from '../../../Components/Dashboard/Client/Messages/ConversationPanel'
import ChatPanel from '../../../Components/Dashboard/Client/Messages/ChatPanel'
import { createHandleLogout } from './handleLogout'
import '../../Style/AdminDashboardPage.css'
import '../../Style/ExpertDashboardPage.css'
import '../Client/ClientMarketplace.css'

const MessagesPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <ExpertSidebar activeTab="messages" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="admin-main-panel expert-main-panel messages-main">
        <ExpertHeader
          title="Messages"
          subtitle="Connect and collaborate with your clients in real-time."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="messages-layout">
          <ConversationPanel />
          <ChatPanel />
        </section>
      </main>
    </div>
  )
}

export default MessagesPage
