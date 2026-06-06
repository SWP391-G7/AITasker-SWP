import { ChevronRight } from 'lucide-react';
import ContractRow from './ContractRow';

const ActiveContractsCard = () => {
  return (
    <section className="card glass-card hover-card shadow-lg rounded-4 overflow-hidden">
      <div 
        className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center" 
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <h2 className="h6 fw-bold mb-0 text-white text-uppercase tracking-widest">
          Active Contracts
        </h2>
        <button className="btn btn-link p-0 text-primary text-decoration-none small fw-bold text-uppercase tracking-widest">
          View All Projects <ChevronRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-hover table-borderless align-middle mb-0" style={{ color: '#fff' }}>
          <thead 
            className="small text-secondary fw-bold text-uppercase border-bottom" 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.01)', 
              borderColor: 'rgba(255,255,255,0.05)' 
            }}
          >
            <tr>
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3 text-center">Milestones</th>
              <th className="px-4 py-3">Next Deadline</th>
              <th className="px-4 py-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody className="small">
            <ContractRow 
              name="LLM Optimization for Edge" 
              client="TechCorp AI" 
              progress="2/3 Done" 
              deadline="In 2 Days" 
              urgent 
            />
            <ContractRow 
              name="Custom RAG Development" 
              client="DataMind" 
              progress="1/5 Done" 
              deadline="Oct 14, 2026" 
            />
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ActiveContractsCard;
