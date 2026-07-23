/**
 * Frontend module: Components/Dashboard/Client/ClientActiveProjectsTable.jsx
 *
 * Vai trò: Component Client Active Projects Table: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useNavigate } from "react-router-dom";

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get status class”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getStatusClass = (status) => {
  if (status === "In Progress") return "in-progress";
  if (status === "Under Review") return "under-review";
  if (status === "Completed") return "completed";
  return "";
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get initials”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase();
};

// React component “Client Active Projects Table” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ClientActiveProjectsTable({ projects }) {
  const navigate = useNavigate();

  return (
    <div className="client-panel active-projects-panel">
      <div className="client-panel-header">
        <h2>Active Projects</h2>

        <button
          className="view-all-btn"
          onClick={() => navigate("/client/projects")}
        >
          View All →
        </button>
      </div>

      <table className="client-projects-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Expert</th>
            <th>Status</th>
            <th>Budget</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <td>
                <strong>{project.name}</strong>
                <p>{project.description}</p>
              </td>

              <td>
                <div className="expert-cell">
                  <span className="expert-avatar">
                    {getInitials(project.expert)}
                  </span>
                  <span>{project.expert}</span>
                </div>
              </td>

              <td>
                <span className={`client-status ${getStatusClass(project.status)}`}>
                  <span className="status-dot"></span>
                  {project.status}
                </span>
              </td>

              <td className="budget-cell">{project.budget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientActiveProjectsTable;