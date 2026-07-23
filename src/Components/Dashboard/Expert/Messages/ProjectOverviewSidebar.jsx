/**
 * Frontend module: Components/Dashboard/Expert/Messages/ProjectOverviewSidebar.jsx
 *
 * Vai trò: Component Project Overview Sidebar: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import React from 'react';
import { FileText, Image, Table, ExternalLink } from 'lucide-react';

// React component “Project Overview Sidebar” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ProjectOverviewSidebar = ({ conversation }) => {
  if (!conversation) return null;

  return (
    <aside className="project-overview-sidebar">
      <div>
        <h5 className="sidebar-section-title">Project Overview</h5>
        <div className="project-brief-card">
          <h4 className="project-brief-title">{conversation.project}</h4>
          <div className="milestone-text">
            <span>{conversation.milestone}</span>
            <span>{conversation.progress}% Done</span>
          </div>
          <div className="expert-progress" style={{ height: 6 }}>
            <span style={{ width: `${conversation.progress}%` }}></span>
          </div>
        </div>
      </div>

      <div>
        <h5 className="sidebar-section-title">Shared Files</h5>
        <div className="shared-files-list">
          {(conversation.sharedFiles || []).map((file, idx) => (
            <div key={idx} className="shared-file-item">
              <div className="project-icon-box" style={{ width: 32, height: 32 }}>
                {file.type === 'image' ? <Image size={14} /> : <FileText size={14} />}
              </div>
              <div className="file-info">
                <span className="shared-file-name">{file.name}</span>
                <span className="shared-file-date">{file.date}</span>
              </div>
            </div>
          ))}
          <button className="filter-btn" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
            View All Assets
          </button>
        </div>
      </div>

      <div className="payment-card">
        <h5 className="sidebar-section-title" style={{ marginBottom: 0 }}>Next Milestone Payment</h5>
        <p className="payment-amount">{conversation.nextPayment}</p>
        <span className="payment-status">Pending Approval</span>
      </div>
    </aside>
  );
};

export default ProjectOverviewSidebar;
