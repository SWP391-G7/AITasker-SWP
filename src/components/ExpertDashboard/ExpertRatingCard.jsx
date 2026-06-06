import { Star } from 'lucide-react';
import ProgressKPI from './ProgressKPI';

const ExpertRatingCard = ({ isReady }) => {
  return (
    <section className="card glass-card hover-card p-4 shadow-lg rounded-4">
      <h2 className="text-xs font-bold text-secondary text-uppercase tracking-widest mb-4">
        Expert Rating
      </h2>
      <div 
        className="d-flex flex-column align-items-center text-center mb-4 rounded-4 py-4 border shadow-inner" 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.02)', 
          borderColor: 'rgba(255, 255, 255, 0.05)' 
        }}
      >
        <div className="display-4 fw-black mb-2 text-primary glow-text">5.0</div>
        <div className="d-flex gap-1 text-warning mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="currentColor" />
          ))}
        </div>
        <p className="small text-secondary fw-medium">Professional Rating</p>
      </div>
      
      <div className="d-flex flex-column gap-3">
        <ProgressKPI 
          label="Project Success Rate" 
          value={100} 
          color="#22C55E" 
          trigger={isReady} 
        />
        <ProgressKPI 
          label="On-Time Delivery" 
          value={98} 
          color="#0d6efd" 
          trigger={isReady} 
        />
      </div>
    </section>
  );
};

export default ExpertRatingCard;
