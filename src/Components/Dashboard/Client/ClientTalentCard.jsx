/**
 * Frontend module: Components/Dashboard/Client/ClientTalentCard.jsx
 *
 * Vai trò: Component Client Talent Card: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

// React component “Client Talent Card” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ClientTalentCard() {
  const navigate = useNavigate();

  return (
    <div className="talent-cta-card">
      <div className="talent-icon-box">
        <Lightbulb size={24} />
      </div>

      <h2>Need specialized AI talent?</h2>

      <p>
        Post a new task to get matched with top-tier AI engineers within 24
        hours.
      </p>

      <button onClick={() => navigate("/client/post-job")}>
        Post a Task Now
      </button>
    </div>
  );
}

export default ClientTalentCard;