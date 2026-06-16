const DisputeDetailModal = ({ dispute, onClose, onResolve }) => {
  if (!dispute) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="success-modal"
        style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', maxWidth: '500px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
          <h3 className="fw-bold mb-0 text-white" style={{ fontSize: '1.25rem' }}>{dispute.title}</h3>
          <button className="btn-close btn-close-white" onClick={onClose} style={{ filter: 'invert(1)' }}></button>
        </div>

        <div className="text-start mb-4">
          <span className={`dispute-tag ${dispute.tagClass} mb-3`}>{dispute.tag}</span>
          <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>Case ID:</strong> {dispute.caseId}</p>
          <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>Client Organization:</strong> {dispute.client}</p>
          <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>Assigned Expert:</strong> {dispute.expert}</p>

          <div className="bg-dark bg-opacity-20 p-3 rounded-3 mt-3 border border-secondary border-opacity-10">
            <span className="d-block text-warning small fw-bold mb-1">Administrative Note:</span>
            <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
              This dispute has been escalated to system administration for review. Please check milestone deliverables, chat records, and expert files before releasing escrow funds or authorizing a full refund.
            </p>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end pt-2">
          <button className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm px-4 py-2 fw-semibold" onClick={() => onResolve(dispute.id)}>
            Resolve dispute
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisputeDetailModal
