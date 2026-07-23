/**
 * Frontend module: Components/Dashboard/Expert/TechnicalStackCard.jsx
 *
 * Vai trò: Component Technical Stack Card: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Code2 } from 'lucide-react'

// React component “Technical Stack Card” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const TechnicalStackCard = ({ skills }) => (
  <div className="admin-panel-card expert-stack-card">
    <div className="panel-header">
      <h2 className="panel-title">Technical Stack</h2>
      <Code2 size={18} className="text-primary" />
    </div>
    <div className="expert-skill-list">
      {skills && skills.length > 0 ? (
        skills.map((skill) => (
          <span key={skill} className="expert-skill-chip">{skill}</span>
        ))
      ) : (
        <span className="text-muted small pb-2 d-inline-block">No skills listed. Update your profile settings.</span>
      )}
    </div>

  </div>
)

export default TechnicalStackCard
