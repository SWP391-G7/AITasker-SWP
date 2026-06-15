import ContractsPanel from './ContractsPanel'
import InvitationsPanel from './InvitationsPanel'

const ExpertContentGrid = ({ contracts, invitations }) => (
  <section className="admin-content-grid">
    <ContractsPanel contracts={contracts} />
    <InvitationsPanel invitations={invitations} />
  </section>
)

export default ExpertContentGrid
