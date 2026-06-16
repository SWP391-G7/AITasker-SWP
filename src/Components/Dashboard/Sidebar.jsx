import { useNavigate, useLocation } from "react-router-dom";
import { getStoredUser } from "../../Services/checkLogin";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = getStoredUser();
  const role = currentUser?.role || "client";
  const dashboardPath = `/${role}/dashboard`;

  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
  };

  const isActive = (paths) => {
    if (Array.isArray(paths)) {
      return paths.includes(location.pathname) ? "active" : "";
    }
    return location.pathname === paths ? "active" : "";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>AITasker</h2>
        <p>AI Services Marketplace</p>
      </div>

      <nav className="sidebar-menu">
        <a 
          className={`menu-item ${isActive([dashboardPath, "/dashboard"])}`} 
          href="#"
          onClick={(e) => handleNavigation(dashboardPath, e)}
        >
          <span>▦</span>
          Dashboard
        </a>

        <a 
          className={`menu-item ${isActive("/my-jobs")}`} 
          href="#"
          onClick={(e) => handleNavigation("/my-jobs", e)}
        >
          <span>📁</span>
          My Projects
        </a>

        <a 
          className={`menu-item ${isActive("/post-job")}`} 
          href="#"
          onClick={(e) => handleNavigation("/post-job", e)}
        >
          <span>＋</span>
          Post a Job
        </a>

        <a className="menu-item" href="#" onClick={(e) => e.preventDefault()}>
          <span>✉</span>
          Messages
        </a>

        <a className="menu-item" href="#" onClick={(e) => e.preventDefault()}>
          <span>💳</span>
          Billing
        </a>

        <a className="menu-item" href="#" onClick={(e) => e.preventDefault()}>
          <span>⚙</span>
          Settings
        </a>
      </nav>

      <div className="sidebar-bottom">
        <button 
          className="post-task-btn" 
          onClick={(e) => handleNavigation("/post-job", e)}
        >
          ＋ Post a New Task
        </button>
      </div>
    </aside>
  )
}

export default Sidebar;