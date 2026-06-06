import { EXPERT_TECHNICAL_STACK } from '../../services/expertDashboardData';

const TechnicalStackCard = () => {
  return (
    <section className="card glass-card hover-card p-4 shadow-lg rounded-4">
      <h2 className="text-xs font-bold text-secondary text-uppercase tracking-widest mb-4">
        Technical Stack
      </h2>
      <div className="d-flex flex-wrap gap-2">
        {EXPERT_TECHNICAL_STACK.map(skill => (
          <span 
            key={skill} 
            className="px-3 py-2 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill text-[11px] fw-bold hover:bg-opacity-25 transition-all cursor-default shadow-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
};

export default TechnicalStackCard;
