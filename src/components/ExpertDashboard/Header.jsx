import { useNavigate } from 'react-router-dom';
import { SearchIcon, Bell, User, Settings, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header 
      className="navbar border-bottom sticky-top px-4 py-3 shadow-sm" 
      style={{ 
        height: '80px', 
        backgroundColor: 'rgba(13, 28, 50, 0.7)', 
        backdropFilter: 'blur(20px)', 
        borderColor: 'rgba(255,255,255,0.05)' 
      }}
    >
      <div className="d-flex flex-column">
        <h1 className="h5 fw-bold mb-0 text-truncate text-white">Expert Overview</h1>
        <p className="small text-secondary mb-0 opacity-75">
          Your performance is <span className="text-success fw-bold">▲ 12.4%</span> this month.
        </p>
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="position-relative d-none d-md-block">
          <SearchIcon 
            size={16} 
            className="position-absolute translate-middle-y text-secondary opacity-50" 
            style={{ left: '15px', top: '50%' }} 
          />
          <input 
            type="text" 
            placeholder="Search projects, tasks..." 
            className="form-control rounded-pill border-0 ps-5 py-2 text-white small shadow-none search-input"
            style={{ 
              width: '280px', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              transition: 'all 0.3s ease' 
            }}
          />
        </div>
        
        <button className="btn btn-link position-relative text-secondary p-2 shadow-none border-0">
          <Bell size={18} />
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary border border-dark" 
            style={{ width: '8px', height: '8px', padding: 0 }}
          >
            {' '}
          </span>
        </button>

        <div className="dropdown border-start border-white-10 ps-4">
          <div 
            className="d-flex align-items-center gap-3 cursor-pointer"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="text-end d-none d-md-block">
              <p className="small fw-bold mb-0 leading-tight text-white">
                {user?.name || user?.username || 'Alex Rivera'}
              </p>
              <p 
                className="text-secondary fw-bold text-uppercase mb-0 opacity-50" 
                style={{ fontSize: '9px', letterSpacing: '1px' }}
              >
                {user?.role === 'expert' ? 'AI Expert' : (user?.role || 'User')}
              </p>
            </div>
            <div 
              className="rounded-3 border border-white-10 overflow-hidden" 
              style={{ width: '40px', height: '40px' }}
            >
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d6efd&color=fff`} 
                alt="User avatar" 
                className="w-100 h-100 object-cover" 
              />
            </div>
          </div>
          <ul 
            className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-white-5 shadow-lg mt-2" 
            aria-labelledby="userDropdown" 
            style={{ backgroundColor: '#12213D' }}
          >
            <li>
              <button 
                className="dropdown-item small py-2 d-flex align-items-center gap-2" 
                onClick={() => navigate('/profile')}
              >
                <User size={16} /> View Profile
              </button>
            </li>
            <li>
              <button 
                className="dropdown-item small py-2 d-flex align-items-center gap-2" 
                onClick={() => navigate('/settings')}
              >
                <Settings size={16} /> Settings
              </button>
            </li>
            <li>
              <hr className="dropdown-divider border-white-5" />
            </li>
            <li>
              <button 
                className="dropdown-item small py-2 d-flex align-items-center gap-2 text-danger" 
                onClick={onLogout}
              >
                <LogOut size={16} /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
