import ClientProjectsPanel from './ClientProjectsPanel'
import ClientActivityPanel from './ClientActivityPanel'

const ClientContentGrid = ({ projects, activities }) => (
  <section className="admin-content-grid">
    <ClientProjectsPanel projects={projects} />
    <ClientActivityPanel activities={activities} />
  </section>
)

export default ClientContentGrid