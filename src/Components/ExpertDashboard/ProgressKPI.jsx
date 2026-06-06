const ProgressKPI = ({ label, value, color, trigger }) => (
  <div className="w-100">
    <div className="d-flex justify-content-between mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '10px' }}>
      <span>{label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="progress rounded-pill shadow-inner" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <div 
        className="progress-bar rounded-pill" 
        role="progressbar" 
        style={{ 
          width: trigger ? `${value}%` : '0%', 
          backgroundColor: color, 
          boxShadow: `0 0 10px ${color}80`, 
          transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }}
      />
    </div>
  </div>
);

export default ProgressKPI;
