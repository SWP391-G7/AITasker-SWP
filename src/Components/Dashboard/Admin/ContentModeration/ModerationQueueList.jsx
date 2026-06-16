import ModerationQueueCard from './ModerationQueueCard'

const ModerationQueueList = ({ items }) => (
  <section className="moderation-list">
    {items.map((item) => (
      <ModerationQueueCard item={item} key={item.id} />
    ))}
  </section>
)

export default ModerationQueueList
