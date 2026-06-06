import { DollarSign, Briefcase } from 'lucide-react';

const InvitationItem = ({ role, budget, duration }) => (
  <div 
    className="p-3 rounded-4 border border-white-5" 
    style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
  >
    <h6 className="small fw-bold text-primary mb-3 lh-base">{role}</h6>
    <div className="d-flex gap-3 mb-3">
      <div 
        className="d-flex align-items-center gap-1 text-success fw-bold p-1 rounded bg-success bg-opacity-10" 
        style={{ fontSize: '10px' }}
      >
        <DollarSign size={10} strokeWidth={3} />{budget}
      </div>
      <div 
        className="d-flex align-items-center gap-1 text-primary fw-bold p-1 rounded bg-primary bg-opacity-10" 
        style={{ fontSize: '10px' }}
      >
        <Briefcase size={10} strokeWidth={3} />{duration}
      </div>
    </div>
    <div className="d-flex gap-2">
      <button className="btn btn-primary btn-sm w-100 rounded-3 fw-bold small">
        Accept
      </button>
      <button className="btn btn-outline-secondary btn-sm w-100 rounded-3 fw-bold small text-secondary">
        Decline
      </button>
    </div>
  </div>
);

export default InvitationItem;
