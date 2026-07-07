import ModerationQueueCard from './ModerationQueueCard'

const ModerationQueueList = ({ items, onApprove, onReject }) => (
  <section className="moderation-list">
    {items.map((item) => (
      <ModerationQueueCard item={item} key={item.id} onApprove={onApprove} onReject={onReject} />
    ))}
  </section>
)

export default ModerationQueueList
