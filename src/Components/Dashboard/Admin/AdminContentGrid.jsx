/**
 * Frontend module: Components/Dashboard/Admin/AdminContentGrid.jsx
 *
 * Vai trò: Component Admin Content Grid: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import DisputesPanel from './DisputesPanel'
import ModerationPanel from './ModerationPanel'

// React component “Admin Content Grid” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
