import React from 'react';
import { FileText, Image, File } from 'lucide-react';

const ProjectOverviewSidebar = ({ conversation }) => {
  if (!conversation) return null;

  const projectTitle = conversation.project || "General Inquiry";
  const milestone = conversation.milestone || "General Conversation";
  const progress = conversation.progress ?? 100;
  const sharedFiles = conversation.sharedFiles || [];
  const nextPayment = conversation.nextPayment || "N/A";

  return (
    <aside className="project-overview-sidebar">
      <div>
        <h5 className="sidebar-section-title">Project Overview</h5>
        <div className="project-brief-card">
          <h4 className="project-brief-title">{projectTitle}</h4>
          <div className="milestone-text">
            <span>{milestone}</span>
            <span>{progress}% Done</span>
          </div>
          <div className="expert-progress" style={{ height: 6 }}>
            <span style={{ width: `${progress}%` }}></span>
          </div>
        </div>
      </div>

      <div>
        <h5 className="sidebar-section-title">Shared Files</h5>
        <div className="shared-files-list">
          {sharedFiles.length === 0 ? (
            <div style={{ padding: '10px 0', fontSize: '0.8rem', color: '#64748b' }}>
              No files shared yet
            </div>
          ) : (
            sharedFiles.map((file, idx) => (
              <div key={idx} className="shared-file-item">
                <div className="project-icon-box" style={{ width: 32, height: 32 }}>
                  {file.type === 'image' ? <Image size={14} /> : <FileText size={14} />}
                </div>
                <div className="file-info">
                  <span className="shared-file-name">{file.name}</span>
                  <span className="shared-file-date">{file.date}</span>
                </div>
              </div>
            ))
          )}
          <button className="filter-btn" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
            View All Assets
          </button>
        </div>
      </div>

      <div className="payment-card">
        <h5 className="sidebar-section-title" style={{ marginBottom: 0 }}>Next Milestone Payment</h5>
        <p className="payment-amount">{nextPayment}</p>
        <span className="payment-status">Pending Approval</span>
      </div>
    </aside>
  );
};

export default ProjectOverviewSidebar;
