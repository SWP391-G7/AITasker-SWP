const MetricCard = ({ label, value }) => (
  <div className="col-12 col-sm-4">
    <div 
      className="p-3 rounded-3 border h-100 transition-all" 
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        borderColor: 'rgba(255,255,255,0.05)' 
      }}
    >
      <p 
        className="text-secondary fw-bold text-uppercase mb-1 opacity-50" 
        style={{ fontSize: '10px', letterSpacing: '1px' }}
      >
        {label}
      </p>
      <h5 className="fw-bold mb-0 text-primary">{value}</h5>
    </div>
  </div>
);

export default MetricCard;
