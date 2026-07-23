import ModerationQueueCard from './ModerationQueueCard'

const ModerationQueueList = ({ items, onApprove, onReject, onUnpublish }) => (
  <section className="moderation-list">
    {items.map((item) => (
      <ModerationQueueCard
        item={item}
        key={item.id}
        onApprove={onApprove}
        onReject={onReject}
        onUnpublish={onUnpublish}
      />
    ))}
  </section>
)

export default ModerationQueueList
