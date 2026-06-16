import EarningsChart from './EarningsChart'
import TechnicalStackCard from './TechnicalStackCard'

const ExpertBottomGrid = ({ skills }) => (
  <section className="expert-bottom-grid">
    <EarningsChart />
    <TechnicalStackCard skills={skills} />
  </section>
)

export default ExpertBottomGrid
