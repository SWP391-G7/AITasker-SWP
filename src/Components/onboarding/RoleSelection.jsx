/**
 * Frontend module: Components/onboarding/RoleSelection.jsx
 *
 * Vai trò: Component Role Selection: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import "./Onboarding.css";

// React component “Role Selection” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function RoleSelection({ onSelectRole }) {
  return (
    <div className="role-selection">
      <h1>Welcome to AITasker</h1>
      <p>Choose your role to personalize your experience.</p>

      <div className="role-cards">
        <button
          type="button"
          className="role-card"
          onClick={() => onSelectRole("client")}
        >
          <div className="role-icon">💼</div>
          <h2>I'm a Client</h2>
          <p>I want to post AI tasks and hire experts for my projects.</p>
        </button>

        <button
          type="button"
          className="role-card"
          onClick={() => onSelectRole("expert")}
        >
          <div className="role-icon">🧠</div>
          <h2>I'm an Expert</h2>
          <p>I want to offer AI services and work on client projects.</p>
        </button>
      </div>
    </div>
  );
}

export default RoleSelection;