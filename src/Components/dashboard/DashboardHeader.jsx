import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../Services/checkLogin";

function DashboardHeader() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  
  const handleProfileClick = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  const displayName = currentUser?.fullName || "Andy";
  const displayRole = currentUser?.role === "expert" ? "Expert User" : "Client User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="dashboard-header">
      <div>
        <h1>Client Overview</h1>
        <p>Welcome back. Here's what's happening with your projects today.</p>
      </div>

      <div className="header-right">
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Search projects, tasks..." />
        </div>

        <button className="notification-btn">🔔</button>

        <div className="user-profile" onClick={handleProfileClick} style={{ cursor: "pointer" }}>
          <div className="user-info">
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>

          <div className="avatar">{avatarLetter}</div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader