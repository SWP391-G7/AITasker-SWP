/**
 * Frontend module: Components/Dashboard/Admin/ContentModeration/ModerationQueueList.jsx
 *
 * Vai trò: Component Moderation Queue List: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import ModerationQueueCard from './ModerationQueueCard'

// React component “Moderation Queue List” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ModerationQueueList = ({ items, onApprove, onReject, onUnpublish, onRepublish }) => (
  <section className="moderation-list">
    {items.map((item) => (
      <ModerationQueueCard
        item={item}
        key={item.id}
        onApprove={onApprove}
        onReject={onReject}
        onUnpublish={onUnpublish}
        onRepublish={onRepublish}
      />
    ))}
  </section>
)

export default ModerationQueueList
