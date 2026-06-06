import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  DollarSign, 
  MessageSquare, 
  Settings, 
  Plus 
} from 'lucide-react';
import NavItem from './NavItem';

const Sidebar = () => {
  return (
    <aside 
      className="d-none d-lg-flex flex-column position-fixed h-100 border-end" 
      style={{ 
        width: '260px', 
        backgroundColor: 'rgba(9, 20, 38, 0.8)', 
        backdropFilter: 'blur(20px)', 
        zIndex: 1020, 
        borderColor: 'rgba(255,255,255,0.05)' 
      }}
    >
      <div className="p-4 mt-2">
        <div className="d-flex align-items-center gap-3 mb-1 text-decoration-none">
          <div 
            className="rounded-3 bg-primary d-flex align-items-center justify-content-center shadow" 
            style={{ width: '36px', height: '36px' }}
          >
            <span className="fw-bold fs-4 text-white text-center w-100">A</span>
          </div>
          <span className="fs-4 fw-bold tracking-tight text-white">AITasker</span>
        </div>
        <p 
          className="text-secondary fw-bold text-uppercase small tracking-widest mb-0 ms-5" 
          style={{ fontSize: '9px', opacity: 0.7 }}
        >
          AI Services Marketplace
        </p>
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
  );
};

export default Sidebar;
