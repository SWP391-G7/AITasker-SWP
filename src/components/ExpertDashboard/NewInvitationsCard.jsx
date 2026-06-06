import InvitationItem from './InvitationItem';

const NewInvitationsCard = () => {
  return (
    <section className="card glass-card hover-card p-4 shadow-lg rounded-4 h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xs font-bold text-secondary text-uppercase tracking-widest mb-0">
          New Invitations
        </h2>
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 text-[10px] fw-black px-2 py-1 animate-pulse rounded-pill">
          NEW
        </span>
      </div>
      
      <div className="d-flex flex-column gap-3">
        <InvitationItem 
          role="Distributed Neural Network Architect" 
          budget="$200/hr" 
          duration="3 months" 
        />
        <InvitationItem 
          role="Fine-Tuning Lead for Medical AI" 
          budget="$180/hr" 
          duration="2 months" 
        />
      </div>
    </section>
  );
};

export default NewInvitationsCard;
