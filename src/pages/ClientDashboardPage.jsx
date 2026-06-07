import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ClientSidebar from '../Components/Dashboard/Client/ClientSidebar'
import ClientHeader from '../Components/Dashboard/Client/ClientHeader'
import ClientStats from '../Components/Dashboard/Client/ClientStats'
import ClientContentGrid from '../Components/Dashboard/Client/ClientContentGrid'

import {
  initialClientProjects,
  initialClientActivities
} from '../Components/Dashboard/Client/clientDashboardData'

import './Style/AdminDashboardPage.css'

const ClientDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [projects] = useState(initialClientProjects)
  const [activities] = useState(initialClientActivities)
  const [notifications, setNotifications] = useState(2)

  const handleLogout = onLogout || (() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/')
  })

  const filteredProjects = projects.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard-layout">
      <ClientSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="admin-main-panel">
        <ClientHeader
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ClientStats
          projectCount={projects.length}
          proposalCount={3}
          totalSpent="$24,500"
        />

        <ClientContentGrid
          projects={filteredProjects}
          activities={activities}
        />
      </main>
    </div>
  )
}

export default ClientDashboardPage