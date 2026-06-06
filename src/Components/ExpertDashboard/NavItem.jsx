const NavItem = ({ icon, label, active = false, badge }) => {
  return (
    <a 
      href="#" 
      className={`d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 text-decoration-none mb-1 transition-all nav-item-custom ${
        active ? 'nav-item-active text-white' : 'text-secondary opacity-80'
      }`}
    >
      <span className={active ? 'text-white' : 'text-primary'}>{icon}</span>
      <span className={`small fw-bold flex-grow-1 ${active ? '' : 'hover-text-white'}`}>
        {label}
      </span>
      {badge && (
        <span className="badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
          {badge}
        </span>
      )}
    </a>
  );
};

export default NavItem;
