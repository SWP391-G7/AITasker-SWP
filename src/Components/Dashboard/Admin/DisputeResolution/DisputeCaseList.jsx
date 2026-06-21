import DisputeCaseCard from './DisputeCaseCard'

const DisputeCaseList = ({ cases }) => (
  <div className="dispute-case-list">
    {cases.map((item) => (
      <DisputeCaseCard item={item} key={item.id} />
    ))}
  </div>
)

export default DisputeCaseList
