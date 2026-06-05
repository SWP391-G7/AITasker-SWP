import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  DollarSign, 
  MessageSquare, 
  Settings, 
  Plus, 
  Star, 
  SearchIcon,
  Bell,
  ExternalLink,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { EXPERT_CHART_DATA, EXPERT_TECHNICAL_STACK } from '../services/expertDashboardData';
import LoadingSpinner from './LoadingSpinner';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(progress * value);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

const SimpleBarChart = ({ data, isAnimate }) => {
  const maxVal = Math.max(...data.map(d => d.earnings));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="w-100 h-100 d-flex flex-column justify-content-end">
      <div className="flex-grow-1 d-flex align-items-end justify-content-between px-2" style={{ gap: '8px' }}>
        {data.map((item, index) => {
          const heightPercent = (item.earnings / maxVal) * 100;
          const isLast = index === data.length - 1;
          
          return (
            <div 
              key={index} 
              className="flex-grow-1 d-flex flex-column align-items-center position-relative h-100 justify-content-end"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on hover */}
              <div className={`position-absolute translate-middle-x top-0 bg-dark text-white p-1 rounded border border-white-50 small shadow-lg z-3 transition-opacity ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`} style={{ fontSize: '10px', pointerEvents: 'none', whiteSpace: 'nowrap', top: '-30px' }}>
                ${item.earnings.toLocaleString()}
              </div>
              
              {/* Bar */}
              <div 
                className={`w-100 rounded-top transition-all cursor-pointer ${isLast ? 'bg-primary' : ''}`}
                style={{ 
                  height: isAnimate ? `${heightPercent}%` : '0%', 
                  backgroundColor: isLast ? '#0d6efd' : 'rgba(255, 255, 255, 0.1)',
                  transition: 'height 1s ease-out',
                  transitionDelay: `${index * 50}ms`,
                  boxShadow: isLast ? '0 0 15px rgba(59,130,246,0.5)' : 'none'
                }}
              />
            </div>
          );
        })}
      </div>
      {/* X-Axis Labels */}
      <div className="d-flex justify-content-between mt-3 px-2 border-top border-secondary pt-2">
        {data.map((item, index) => (
          <span key={index} className="text-secondary fw-bold text-uppercase" style={{ fontSize: '10px' }}>{item.name}</span>
        ))}
      </div>
    </div>
  );
};

const ExpertDashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Lấy thông tin người dùng từ localStorage
  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch  {
      return null;
    }
  }, []);

  useEffect(() => {
    // Giả lập tải dữ liệu trong 1.5 giây
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const readyTimer = setTimeout(() => setIsReady(true), 100);
      return () => readyTimer && clearTimeout(readyTimer);
    }
  }, [isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="d-flex min-vh-100 text-white position-relative overflow-hidden" style={{ backgroundColor: '#0D1C32', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Decorative Background Blobs */}
      <div className="position-fixed" style={{ top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(13, 110, 253, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
      <div className="position-fixed" style={{ bottom: '-10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(13, 110, 253, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .glass-card {
            background: rgba(39, 53, 76, 0.6) !important;
            backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          }
          .hover-card {
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
          }
          .hover-card:hover {
            transform: translateY(-8px);
            border-color: rgba(13, 110, 253, 0.3) !important;
            background: rgba(39, 53, 76, 0.8) !important;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3) !important;
          }
          .btn-primary { transition: all 0.2s ease; }
          .btn-primary:hover { transform: scale(1.02); filter: brightness(1.1); }
          .fw-black { font-weight: 900 !important; }
          .content-wrapper { margin-left: 260px; z-index: 1; }
          @media (max-width: 991.98px) {
            .content-wrapper { margin-left: 0 !important; }
          }
          .footer-link { color: #b0b8c4 !important; transition: color 0.2s ease; }
          .footer-link:hover { color: #0d6efd !important; }
          .search-input:focus {
            background-color: rgba(255, 255, 255, 0.06) !important;
            border-color: rgba(13, 110, 253, 0.5) !important;
            box-shadow: 0 0 15px rgba(13, 110, 253, 0.1) !important;
          }
          .nav-item-custom {
            border-left: 3px solid transparent;
            transition: all 0.3s ease;
          }
          .nav-item-custom:hover {
            background: rgba(13, 110, 253, 0.05);
            border-left: 3px solid rgba(13, 110, 253, 0.5);
          }
          .nav-item-active {
            background: linear-gradient(90deg, rgba(13, 110, 253, 0.15) 0%, transparent 100%);
            border-left: 3px solid #0d6efd !important;
          }
          .glow-text { text-shadow: 0 0 15px rgba(13, 110, 253, 0.5); }
          .table-hover tbody tr:hover { background-color: rgba(255, 255, 255, 0.02) !important; }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        `}
      </style>

      <aside className="d-none d-lg-flex flex-column position-fixed h-100 border-end" style={{ width: '260px', backgroundColor: 'rgba(9, 20, 38, 0.8)', backdropFilter: 'blur(20px)', zIndex: 1020, borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="p-4 mt-2">
          <div className="d-flex align-items-center gap-3 mb-1 text-decoration-none">
            <div className="rounded-3 bg-primary d-flex align-items-center justify-content-center shadow" style={{ width: '36px', height: '36px' }}>
              <span className="fw-bold fs-4 text-white text-center w-100">A</span>
            </div>
            <span className="fs-4 fw-bold tracking-tight text-white">AITasker</span>
          </div>
          <p className="text-secondary fw-bold text-uppercase small tracking-widest mb-0 ms-5" style={{ fontSize: '9px', opacity: 0.7 }}>AI Services Marketplace</p>
        </div>

        <nav className="flex-grow-1 px-3 mt-4">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Briefcase size={20} />} label="My Projects" />
          <NavItem icon={<Search size={20} />} label="Find Work" />
          <NavItem icon={<DollarSign size={20} />} label="Earnings" />
          <NavItem icon={<MessageSquare size={20} />} label="Messages" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-3 mt-auto border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <button className="btn btn-primary w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm border-0">
            <Plus size={18} />
            Post a New Task
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column content-wrapper">
        {/* Top Header */}
        <header className="navbar border-bottom sticky-top px-4 py-3 shadow-sm" style={{ height: '80px', backgroundColor: 'rgba(13, 28, 50, 0.7)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="d-flex flex-column">
            <h1 className="h5 fw-bold mb-0 text-truncate text-white">Expert Overview</h1>
            <p className="small text-secondary mb-0 opacity-75">
              Your performance is <span className="text-success fw-bold">▲ 12.4%</span> this month.
            </p>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="position-relative d-none d-md-block">
              <SearchIcon size={16} className="position-absolute translate-middle-y text-secondary opacity-50" style={{ left: '15px', top: '50%' }} />
              <input 
                type="text" 
                placeholder="Search projects, tasks..." 
                className="form-control rounded-pill border-0 ps-5 py-2 text-white small shadow-none search-input"
                style={{ width: '280px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}
              />
            </div>
            
            <button className="btn btn-link position-relative text-secondary p-2 shadow-none border-0">
              <Bell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary border border-dark" style={{ width: '8px', height: '8px', padding: 0 }}> </span>
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
                  <p className="text-secondary fw-bold text-uppercase mb-0 opacity-50" style={{ fontSize: '9px', letterSpacing: '1px' }}>
                    {user?.role === 'expert' ? 'AI Expert' : (user?.role || 'User')}
                  </p>
                </div>
                <div className="rounded-3 border border-white-10 overflow-hidden" style={{ width: '40px', height: '40px' }}>
                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d6efd&color=fff`} alt="User avatar" className="w-100 h-100 object-cover" />
                </div>
              </div>
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-white-5 shadow-lg mt-2" aria-labelledby="userDropdown" style={{ backgroundColor: '#12213D' }}>
                <li><button className="dropdown-item small py-2 d-flex align-items-center gap-2" onClick={() => navigate('/profile')}><User size={16} /> View Profile</button></li>
                <li><button className="dropdown-item small py-2 d-flex align-items-center gap-2" onClick={() => navigate('/settings')}><Settings size={16} /> Settings</button></li>
                <li><hr className="dropdown-divider border-white-5" /></li>
                <li><button className="dropdown-item small py-2 d-flex align-items-center gap-2 text-danger" onClick={handleLogout}><LogOut size={16} /> Logout</button></li>
              </ul>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="container-fluid p-4">
          <div className="row g-4">
            
            {/* Column Left & Middle (8/12) */}
            <div className="col-12 col-xl-8 d-flex flex-column gap-4">
              {/* Card 1: Financial Performance */}
              <section className="card glass-card hover-card p-4 shadow-lg rounded-4 overflow-hidden">
                <div className="d-flex flex-column md:flex-row justify-content-between align-items-md-center mb-4 gap-3">
                  <div>
                    <h2 className="small fw-bold text-secondary text-uppercase tracking-widest mb-1">Financial Performance</h2>
                    <div className="d-flex align-items-baseline gap-2 glow-text">
                      <span className="h1 fw-bold mb-0 text-primary"><AnimatedNumber value={24850.00} /></span>
                      <span className="small text-secondary fw-medium">Total Lifetime Earnings</span>
                    </div>
                  </div>
                  <button className="btn btn-primary px-4 py-2 rounded-3 fw-bold transition-all shadow-sm">
                    Withdraw Funds
                  </button>
                </div>

                <div className="row g-3 mb-4">
                  <MetricCard label="Available Balance" value="$8,240.00" />
                  <MetricCard label="Pending Clearance" value="$4,120.00" />
                  <MetricCard label="Withdrawn" value="$12,490.00" />
                </div>

                <div className="w-100" style={{ height: '280px' }}>
                  <SimpleBarChart data={EXPERT_CHART_DATA} isAnimate={isReady} />
                </div>
              </section>

              {/* Card 4: Active Contracts */}
              <section className="card glass-card hover-card shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <h2 className="h6 fw-bold mb-0 text-white text-uppercase tracking-widest">Active Contracts</h2>
                  <button className="btn btn-link p-0 text-primary text-decoration-none small fw-bold text-uppercase tracking-widest">
                    View All Projects <ChevronRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-hover table-borderless align-middle mb-0" style={{ color: '#fff' }}>
                    <thead className="small text-secondary fw-bold text-uppercase border-bottom" style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)' }}>
                      <tr>
                        <th className="px-4 py-3">Project Name</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3 text-center">Milestones</th>
                        <th className="px-4 py-3">Next Deadline</th>
                        <th className="px-4 py-3 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      <ContractRow name="LLM Optimization for Edge" client="TechCorp AI" progress="2/3 Done" deadline="In 2 Days" urgent />
                      <ContractRow name="Custom RAG Development" client="DataMind" progress="1/5 Done" deadline="Oct 14, 2026" />
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Column Right (4/12) */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              {/* Card 2: Expert Rating */}
              <section className="card glass-card hover-card p-4 shadow-lg rounded-4">
                <h2 className="text-xs font-bold text-secondary text-uppercase tracking-widest mb-4">Expert Rating</h2>
                <div className="d-flex flex-column align-items-center text-center mb-4 rounded-4 py-4 border shadow-inner" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="display-4 fw-black mb-2 text-primary glow-text">5.0</div>
                  <div className="d-flex gap-1 text-warning mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                  <p className="small text-secondary fw-medium">Professional Rating</p>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <ProgressKPI label="Project Success Rate" value={100} color="#22C55E" trigger={isReady} />
                  <ProgressKPI label="On-Time Delivery" value={98} color="#0d6efd" trigger={isReady} />
                </div>
              </section>

              {/* Card 3: Technical Stack */}
              <section className="card glass-card hover-card p-4 shadow-lg rounded-4">
                <h2 className="text-xs font-bold text-secondary text-uppercase tracking-widest mb-4">Technical Stack</h2>
                <div className="d-flex flex-wrap gap-2">
                  {EXPERT_TECHNICAL_STACK.map(skill => (
                    <span key={skill} className="px-3 py-2 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill text-[11px] fw-bold hover:bg-opacity-25 transition-all cursor-default shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Card 5: New Invitations */}
              <section className="card glass-card hover-card p-4 shadow-lg rounded-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="text-xs font-bold text-secondary text-uppercase tracking-widest mb-0">New Invitations</h2>
                  <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 text-[10px] fw-black px-2 py-1 animate-pulse rounded-pill">NEW</span>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <InvitationItem role="Distributed Neural Network Architect" budget="$200/hr" duration="3 months" />
                  <InvitationItem role="Fine-Tuning Lead for Medical AI" budget="$180/hr" duration="2 months" />
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-4 px-4 border-top" style={{ backgroundColor: '#091426', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="container-fluid">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex flex-wrap justify-content-center gap-4">
                <a href="#" className="footer-link text-decoration-none small">Privacy Policy</a>
                <a href="#" className="footer-link text-decoration-none small">Terms of Service</a>
                <a href="#" className="footer-link text-decoration-none small">Help Center</a>
                <a href="#" className="footer-link text-decoration-none small">API Documentation</a>
              </div>
              <p className="text-secondary mb-0 small opacity-75">
                &copy; 2026 AITasker. Developed for AI Workforce Management.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Helper Sub-components
const NavItem = ({ icon, label, active = false, badge }) => {
  const activeStyle = {
    backgroundColor: '#0d6efd',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  };
  
  return (
    <a 
      href="#" 
      className={`d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 text-decoration-none mb-1 transition-all nav-item-custom ${active ? 'nav-item-active text-white' : 'text-secondary opacity-80'}`}
    >
      <span className={active ? 'text-white' : 'text-primary'}>{icon}</span>
      <span className={`small fw-bold flex-grow-1 ${active ? '' : 'hover-text-white'}`}>{label}</span>
      {badge && <span className="badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>{badge}</span>}
    </a>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="col-12 col-sm-4">
    <div className="p-3 rounded-3 border h-100 transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <p className="text-secondary fw-bold text-uppercase mb-1 opacity-50" style={{ fontSize: '10px', letterSpacing: '1px' }}>{label}</p>
      <h5 className="fw-bold mb-0 text-primary">{value}</h5>
    </div>
  </div>
);

const ProgressKPI = ({ label, value, color, trigger }) => (
  <div className="w-100">
    <div className="d-flex justify-content-between mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '10px' }}>
      <span>{label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="progress rounded-pill shadow-inner" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <div className="progress-bar rounded-pill" role="progressbar" style={{ width: trigger ? `${value}%` : '0%', backgroundColor: color, boxShadow: `0 0 10px ${color}80`, transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
    </div>
  </div>
);

const ContractRow = ({ name, client, progress, deadline, urgent = false }) => (
  <tr className="border-bottom border-white-5 transition-all cursor-pointer">
    <td className="px-4 py-4 fw-bold text-primary">{name}</td>
    <td className="px-4 py-4 text-secondary">{client}</td>
    <td className="px-4 py-4 text-center">
      <span className="badge bg-dark border border-white-10 p-2 rounded-3 text-secondary">{progress}</span>
    </td>
    <td className="px-4 py-4">
      <span className={`badge rounded-3 p-2 fw-bold ${urgent ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}`} style={{ fontSize: '11px' }}>
        {deadline}
      </span>
    </td>
    <td className="px-4 py-4 text-end text-secondary">
      <button className="btn btn-link text-secondary p-1">
        <ExternalLink size={16} />
      </button>
    </td>
  </tr>
);

const InvitationItem = ({ role, budget, duration }) => (
  <div className="p-3 rounded-4 border border-white-5" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
    <h6 className="small fw-bold text-primary mb-3 lh-base">{role}</h6>
    <div className="d-flex gap-3 mb-3">
      <div className="d-flex align-items-center gap-1 text-success fw-bold p-1 rounded bg-success bg-opacity-10" style={{ fontSize: '10px' }}>
        <DollarSign size={10} strokeWidth={3} />{budget}
      </div>
      <div className="d-flex align-items-center gap-1 text-primary fw-bold p-1 rounded bg-primary bg-opacity-10" style={{ fontSize: '10px' }}>
        <Briefcase size={10} strokeWidth={3} />{duration}
      </div>
    </div>
    <div className="d-flex gap-2">
      <button className="btn btn-primary btn-sm w-100 rounded-3 fw-bold small">Accept</button>
      <button className="btn btn-outline-secondary btn-sm w-100 rounded-3 fw-bold small text-secondary">Decline</button>
    </div>
  </div>
);

export default ExpertDashboardPage;