import DisputesPanel from './DisputesPanel'
import ModerationPanel from './ModerationPanel'

const AdminContentGrid = ({ disputes, moderations, onApproveModeration, onRejectModeration, onSelectDispute }) => (
  <section className="admin-content-grid">
    <ModerationPanel
      moderations={moderations}
      onApprove={onApproveModeration}
      onReject={onRejectModeration}
    />
    <DisputesPanel disputes={disputes} onSelectDispute={onSelectDispute} />
  </section>
)

export default AdminContentGrid
