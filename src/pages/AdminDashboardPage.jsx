import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import adminAvatar from '../Components/LandingPages/image/user_avatar.png'
import expertSarah from '../Components/LandingPages/image/expert_sarah.png'
import './Style/AdminDashboardPage.css'
import {
  LayoutDashboard,
  Users,
  Shield,
  Scale,
  BarChart3,
  Settings,
  Search,
  Bell,
  ShieldAlert,
  TrendingUp,
  FileText,
  LogOut,
  Home
} from 'lucide-react'

const AdminDashboardPage = ({ onLogout }) => {
  const navigate = useNavigate()
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selected dispute for detail modal
  const [selectedDispute, setSelectedDispute] = useState(null)
  
  // Interactive Moderation Tasks State
  const [moderations, setModerations] = useState([
    { id: 'mod-1', target: 'Content ID: #AI-9021', reason: 'Potential Spam', type: 'content' },
    { id: 'mod-2', target: 'User: Alex Rivers', reason: 'Inappropriate Bio', type: 'user', name: 'Alex Rivers', avatar: expertSarah },
    { id: 'mod-3', target: 'Content ID: #JOB-4412', reason: 'Misleading Category', type: 'content' }
  ])
  
  // Interactive Disputes State
  const [disputes, setDisputes] = useState([
    { id: 'disp-1', title: 'Payment Withheld', caseId: '#D-44102', client: 'TechCorp', expert: 'Sarah K.', tag: 'URGENT', tagClass: 'tag-urgent' },
    { id: 'disp-2', title: 'Deadline Missed', caseId: '#D-44098', client: 'GlobalSoft', expert: 'Mike D.', tag: 'UNDER REVIEW', tagClass: 'tag-review' },
    { id: 'disp-3', title: 'Quality Claim', caseId: '#D-44115', client: 'SoloDev', expert: 'AI-Agency', tag: 'NEW', tagClass: 'tag-new' }
  ])

  // Notifications state
  const [notifications, setNotifications] = useState(3)

  const handleApproveMod = (id) => {
    setModerations(prev => prev.filter(item => item.id !== id))
  };

  const handleRejectMod = (id) => {
    setModerations(prev => prev.filter(item => item.id !== id))
  };

  const handleResolveDispute = (id) => {
    setDisputes(prev => prev.filter(item => item.id !== id))
    setSelectedDispute(null)
  }

  const handleSidebarClick = (tabId) => {
    setActiveTab(tabId)
  }

  // Filtering lists based on search bar query
  const filteredModerations = moderations.filter(item =>
    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDisputes = disputes.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.expert.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard-layout">
      {/* 1. Sidebar Panel */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand mb-0">AITasker</Link>
          <span className="sidebar-subtitle">AI Services Marketplace</span>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <div 
              className={`sidebar-item-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-item-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('users')}
            >
              <Users size={18} />
              <span>User Management</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-item-link ${activeTab === 'moderation' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('moderation')}
            >
              <Shield size={18} />
              <span>Content Moderation</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-item-link ${activeTab === 'disputes' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('disputes')}
            >
              <Scale size={18} />
              <span>Dispute Resolution</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-item-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('analytics')}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-item-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </li>
        </ul>

        {/* Sidebar Footer options */}
        <div className="mt-auto pt-4 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
          <Link to="/" className="sidebar-item-link py-2 px-3">
            <Home size={18} />
            <span>Return to Site</span>
          </Link>
          <div 
            className="sidebar-item-link py-2 px-3 text-danger" 
            onClick={onLogout || (() => {
              localStorage.removeItem("token");
              localStorage.removeItem("email");
              navigate('/');
            })}
            style={{ cursor: 'pointer' }}
          >
            <LogOut size={18} />
            <span>Log out</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Panel */}
      <main className="admin-main-panel">
        
        {/* Top Header Bar */}
        <header className="admin-header-section">
          <div className="admin-header-title">
            <h1>Admin Command Center</h1>
            <p>System oversight and marketplace operations</p>
          </div>

          {/* Search Box */}
          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input 
              type="text" 
              placeholder="Search users, tasks, or disputes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Profile & Notifications Widget */}
          <div className="d-flex align-items-center gap-3">
            <button className="icon-button position-relative" aria-label="System Notifications" onClick={() => setNotifications(0)}>
              <Bell size={20} />
              {notifications > 0 && <span className="icon-badge bg-sky"></span>}
            </button>

            <div className="admin-profile-widget">
              <div className="admin-profile-info">
                <span className="admin-profile-name">Admin</span>
                <span className="admin-profile-role">Root Access</span>
              </div>
              <img src={adminAvatar} alt="Admin Profile" className="admin-profile-avatar" />
            </div>
          </div>
        </header>

        {/* 3. Stat Cards Row */}
        <section className="admin-stats-grid">
          {/* Card 1 */}
          <div className="admin-stat-card">
            <div>
              <div className="stat-title">Total Active Users</div>
              <div className="stat-value">12,842</div>
              <div className="stat-trend trend-up">
                <TrendingUp size={14} />
                <span>+4.2% from last week</span>
              </div>
            </div>
            <div className="stat-icon-box">
              <Users size={20} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="admin-stat-card">
            <div>
              <div className="stat-title">Pending Moderation</div>
              <div className="stat-value">{moderations.length}</div>
              <div className="stat-trend text-muted">
                <span>Avg response time: 2.4h</span>
              </div>
            </div>
            <div className="stat-icon-box">
              <ShieldAlert size={20} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="admin-stat-card">
            <div>
              <div className="stat-title">Open Disputes</div>
              <div className="stat-value">{disputes.length}</div>
              <div className="stat-trend text-muted">
                <span>8 resolved today</span>
              </div>
            </div>
            <div className="stat-icon-box">
              <Scale size={20} />
            </div>
          </div>
        </section>

        {/* 4. Lists Container Row */}
        <section className="admin-content-grid">
          {/* Moderation Panel */}
          <div className="admin-panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Pending Moderation</h2>
              <span className="panel-link">View All Tasks</span>
            </div>

            <div className="panel-list">
              {filteredModerations.length > 0 ? (
                filteredModerations.map((item) => (
                  <div key={item.id} className="list-item-row">
                    <div className="item-left">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.target} className="item-avatar" />
                      ) : (
                        <div className="item-icon-box">
                          <FileText size={18} />
                        </div>
                      )}
                      <div className="item-details">
                        <span className="item-name">{item.target}</span>
                        <span className="item-reason">
                          Reason: <span className="reason-highlight">{item.reason}</span>
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="btn-reject" 
                        onClick={() => handleRejectMod(item.id)}
                      >
                        Reject
                      </button>
                      <button 
                        className="btn-approve" 
                        onClick={() => handleApproveMod(item.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No items pending moderation</div>
              )}
            </div>
          </div>

          {/* Disputes Panel */}
          <div className="admin-panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Active Disputes</h2>
              <span className="panel-link">View Board</span>
            </div>

            <div className="panel-list">
              {filteredDisputes.length > 0 ? (
                filteredDisputes.map((item) => (
                  <div key={item.id} className="list-item-row">
                    <div className="item-left">
                      <div className="item-details">
                        <span className={`dispute-tag ${item.tagClass}`}>{item.tag}</span>
                        <span className="item-name">{item.title} - {item.caseId}</span>
                        <span className="item-reason text-muted">
                          Client: {item.client} | Expert: {item.expert}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn-case align-self-center"
                      onClick={() => setSelectedDispute(item)}
                    >
                      View Case
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No active disputes found</div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Chart Card Panel */}
        <section className="chart-panel-card">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h2 className="panel-title mb-1">New User Growth</h2>
              <p className="text-muted small mb-0">Daily registrations over the last 7 days</p>
            </div>
            <div className="chart-legend">
              <span className="legend-dot"></span>
              <span>Current Week</span>
            </div>
          </div>

          {/* Premium CSS bar chart */}
          <div className="custom-bar-chart">
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ height: '35%' }}></div>
              <span className="chart-label">Mon</span>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ height: '50%' }}></div>
              <span className="chart-label">Tue</span>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ height: '45%' }}></div>
              <span className="chart-label">Wed</span>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <span className="chart-label">Thu</span>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ height: '75%' }}></div>
              <span className="chart-label">Fri</span>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar highlighted" style={{ height: '88%' }}>
                <span className="chart-bar-value">310</span>
              </div>
              <span className="chart-label">Sat</span>
            </div>
            <div className="chart-bar-container">
              <div className="chart-bar" style={{ height: '30%' }}></div>
              <span className="chart-label">Sun</span>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Dispute Case Detail Modal */}
      {selectedDispute && (
        <div className="modal-overlay" onClick={() => setSelectedDispute(null)}>
          <div className="success-modal" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
              <h3 className="fw-bold mb-0 text-white" style={{ fontSize: '1.25rem' }}>{selectedDispute.title}</h3>
              <button 
                className="btn-close btn-close-white" 
                onClick={() => setSelectedDispute(null)}
                style={{ filter: 'invert(1)' }}
              ></button>
            </div>
            
            <div className="text-start mb-4">
              <span className={`dispute-tag ${selectedDispute.tagClass} mb-3`}>{selectedDispute.tag}</span>
              <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>Case ID:</strong> {selectedDispute.caseId}</p>
              <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>Client Organization:</strong> {selectedDispute.client}</p>
              <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>Assigned Expert:</strong> {selectedDispute.expert}</p>
              
              <div className="bg-dark bg-opacity-20 p-3 rounded-3 mt-3 border border-secondary border-opacity-10">
                <span className="d-block text-warning small fw-bold mb-1">Administrative Note:</span>
                <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                  This dispute has been escalated to system administration for review. Please check milestone deliverables, chat records, and expert files before releasing escrow funds or authorizing a full refund.
                </p>
              </div>
            </div>
            
            <div className="d-flex gap-2 justify-content-end pt-2">
              <button className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold" onClick={() => setSelectedDispute(null)}>Close</button>
              <button 
                className="btn btn-primary btn-sm px-4 py-2 fw-semibold" 
                onClick={() => handleResolveDispute(selectedDispute.id)}
              >
                Resolve dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
