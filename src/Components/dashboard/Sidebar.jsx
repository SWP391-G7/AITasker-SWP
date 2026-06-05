function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>AITasker</h2>
        <p>AI Services Marketplace</p>
      </div>

      <nav className="sidebar-menu">
        <a className="menu-item active" href="#">
          <span>▦</span>
          Dashboard
        </a>

        <a className="menu-item" href="#">
          <span>📁</span>
          My Projects
        </a>

        <a className="menu-item" href="#">
          <span>＋</span>
          Post a Job
        </a>

        <a className="menu-item" href="#">
          <span>✉</span>
          Messages
        </a>

        <a className="menu-item" href="#">
          <span>💳</span>
          Billing
        </a>

        <a className="menu-item" href="#">
          <span>⚙</span>
          Settings
        </a>
      </nav>

      <div className="sidebar-bottom">
        <button className="post-task-btn">＋ Post a New Task</button>
      </div>
    </aside>
  )
}

export default Sidebar