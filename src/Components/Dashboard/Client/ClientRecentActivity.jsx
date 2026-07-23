/**
 * Frontend module: Components/Dashboard/Client/ClientRecentActivity.jsx
 *
 * Vai trò: Component Client Recent Activity: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
// React component “Client Recent Activity” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ClientRecentActivity({ activities }) {
  return (
    <div className="client-panel recent-activity-panel">
      <h2>Recent Activity</h2>

      <div className="activity-timeline">
        {Array.isArray(activities) && activities.length > 0 ? (
          activities.map((item, index) => (
            <div className="activity-item" key={item.id}>
              <div className={`activity-dot ${index === 1 ? "success" : ""}`}></div>

              <div className="activity-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted text-center py-3">No recent activity.</div>
        )}
      </div>

      <button className="history-btn">View All History</button>
    </div>
  );
}

export default ClientRecentActivity;