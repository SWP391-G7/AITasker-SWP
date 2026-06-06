import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import expertAvatar from '../Components/LandingPages/image/expert_sarah.png'
import './Style/AdminDashboardPage.css'
import './Style/ExpertDashboardPage.css'
import {
  LayoutDashboard,
  Briefcase,
  Search,
  DollarSign,
  MessageSquare,
  Settings,
  Bell,
  LogOut,
  Home,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  Code2,
  Send,
  Wallet
} from 'lucide-react'

const contracts = [
  { id: 'con-1', name: 'LLM Optimization for Edge', client: 'TechCorp AI', progress: '2/3 Done', deadline: 'In 2 days', status: 'URGENT', tagClass: 'tag-urgent' },
  { id: 'con-2', name: 'Custom RAG Development', client: 'DataMind', progress: '1/5 Done', deadline: 'Jun 14, 2026', status: 'ACTIVE', tagClass: 'tag-review' },
  { id: 'con-3', name: 'Medical AI Fine-Tuning', client: 'HealthLab', progress: '4/4 Done', deadline: 'Ready for review', status: 'REVIEW', tagClass: 'tag-new' }
]

const invitations = [
  { id: 'inv-1', role: 'Distributed Neural Network Architect', budget: '$200/hr', duration: '3 months' },
  { id: 'inv-2', role: 'Fine-Tuning Lead for Medical AI', budget: '$180/hr', duration: '2 months' },
  { id: 'inv-3', role: 'RAG Pipeline Consultant', budget: '$6,500 fixed', duration: '4 weeks' }
]

const skills = ['Python', 'PyTorch', 'LLM Fine-Tuning', 'LangChain', 'Docker', 'RAG Pipelines']

const ExpertDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
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

  const handleLogout = onLogout || (() => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    navigate('/')
  })

  const filteredContracts = contracts.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInvitations = invitations.filter(item =>
    item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.budget.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.duration.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard-layout expert-dashboard-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand mb-0">AITasker</Link>
          <span className="sidebar-subtitle">AI Services Marketplace</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <div className={`sidebar-item-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </li>
          <li>
            <div className={`sidebar-item-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              <Briefcase size={18} />
              <span>My Projects</span>
            </div>
          </li>
          <li>
            <div className={`sidebar-item-link ${activeTab === 'work' ? 'active' : ''}`} onClick={() => setActiveTab('work')}>
              <Search size={18} />
              <span>Find Work</span>
            </div>
          </li>
          <li>
            <div className={`sidebar-item-link ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>
              <DollarSign size={18} />
              <span>Earnings</span>
            </div>
          </li>
          <li>
            <div className={`sidebar-item-link ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              <MessageSquare size={18} />
              <span>Messages</span>
            </div>
          </li>
          <li>
            <div className={`sidebar-item-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </li>
        </ul>

        <div className="mt-auto pt-4 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
          <Link to="/" className="sidebar-item-link py-2 px-3">
            <Home size={18} />
            <span>Return to Site</span>
          </Link>
          <div className="sidebar-item-link py-2 px-3 text-danger" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Log out</span>
          </div>
        </div>
      </aside>

      <main className="admin-main-panel">
        <header className="admin-header-section">
          <div className="admin-header-title">
            <h1>Expert Command Center</h1>
            <p>Project delivery, earnings, and client opportunities</p>
          </div>

          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search projects, clients, or invitations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="icon-button position-relative" aria-label="Expert Notifications" onClick={() => setNotifications(0)}>
              <Bell size={20} />
              {notifications > 0 && <span className="icon-badge bg-sky"></span>}
            </button>

            <div className="admin-profile-widget">
              <div className="admin-profile-info">
                <span className="admin-profile-name">{user?.name || user?.username || 'Sarah Kim'}</span>
                <span className="admin-profile-role">AI Expert</span>
              </div>
              <img src={user?.avatar || expertAvatar} alt="Expert Profile" className="admin-profile-avatar" />
            </div>
          </div>
        </header>

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div>
              <div className="stat-title">Lifetime Earnings</div>
              <div className="stat-value">$24,850</div>
              <div className="stat-trend trend-up">
                <TrendingUp size={14} />
                <span>+12.4% this month</span>
              </div>
            </div>
            <div className="stat-icon-box">
              <Wallet size={20} />
            </div>
          </div>

          <div className="admin-stat-card">
            <div>
              <div className="stat-title">Active Contracts</div>
              <div className="stat-value">{contracts.length}</div>
              <div className="stat-trend text-muted">
                <span>2 milestones due soon</span>
              </div>
            </div>
            <div className="stat-icon-box">
              <Briefcase size={20} />
            </div>
          </div>

          <div className="admin-stat-card">
            <div>
              <div className="stat-title">Expert Rating</div>
              <div className="stat-value">5.0</div>
              <div className="stat-trend expert-stars">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
            <div className="stat-icon-box">
              <Star size={20} />
            </div>
          </div>
        </section>

        <section className="admin-content-grid">
          <div className="admin-panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Active Contracts</h2>
              <span className="panel-link">View All Projects</span>
            </div>

            <div className="panel-list">
              {filteredContracts.map(item => (
                <div key={item.id} className="list-item-row">
                  <div className="item-left">
                    <div className="item-icon-box">
                      <Briefcase size={18} />
                    </div>
                    <div className="item-details">
                      <span className={`dispute-tag ${item.tagClass}`}>{item.status}</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-reason">Client: {item.client} | Milestones: {item.progress}</span>
                    </div>
                  </div>
                  <button className="btn-case">
                    {item.deadline}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel-card">
            <div className="panel-header">
              <h2 className="panel-title">New Invitations</h2>
              <span className="panel-link">Browse Work</span>
            </div>

            <div className="panel-list">
              {filteredInvitations.map(item => (
                <div key={item.id} className="list-item-row">
                  <div className="item-left">
                    <div className="item-icon-box">
                      <Send size={18} />
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.role}</span>
                      <span className="item-reason">Budget: {item.budget} | Duration: {item.duration}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn-reject">Decline</button>
                    <button className="btn-approve">Accept</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="expert-bottom-grid">
          <div className="chart-panel-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h2 className="panel-title mb-1">Monthly Earnings</h2>
                <p className="text-muted small mb-0">Revenue trend over the last 7 months</p>
              </div>
              <div className="chart-legend">
                <span className="legend-dot"></span>
                <span>Current Period</span>
              </div>
            </div>

            <div className="custom-bar-chart">
              {[
                ['Jan', '40%'],
                ['Feb', '32%'],
                ['Mar', '48%'],
                ['Apr', '52%'],
                ['May', '60%'],
                ['Jun', '74%'],
                ['Jul', '88%']
              ].map(([label, height], index, list) => (
                <div key={label} className="chart-bar-container">
                  <div className={`chart-bar ${index === list.length - 1 ? 'highlighted' : ''}`} style={{ height }}>
                    {index === list.length - 1 && <span className="chart-bar-value">$7.5k</span>}
                  </div>
                  <span className="chart-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel-card expert-stack-card">
            <div className="panel-header">
              <h2 className="panel-title">Technical Stack</h2>
              <Code2 size={18} className="text-primary" />
            </div>
            <div className="expert-skill-list">
              {skills.map(skill => (
                <span key={skill} className="expert-skill-chip">{skill}</span>
              ))}
            </div>
            <div className="expert-kpi-list">
              <div className="expert-kpi-row">
                <span><CheckCircle2 size={15} /> Project Success Rate</span>
                <strong>100%</strong>
              </div>
              <div className="expert-progress"><span style={{ width: '100%' }}></span></div>
              <div className="expert-kpi-row">
                <span><Clock size={15} /> On-Time Delivery</span>
                <strong>98%</strong>
              </div>
              <div className="expert-progress"><span style={{ width: '98%' }}></span></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ExpertDashboardPage
