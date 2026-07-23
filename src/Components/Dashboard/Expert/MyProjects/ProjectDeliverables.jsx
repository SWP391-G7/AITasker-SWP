/**
 * Frontend module: Components/Dashboard/Expert/MyProjects/ProjectDeliverables.jsx
 *
 * Vai trò: Component Project Deliverables: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import React from 'react';
import { Filter, SortAsc } from 'lucide-react';
import ProjectCard from './ProjectCard';

// React component “Project Deliverables” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ProjectDeliverables = ({ projects }) => {
  return (
    <section className="project-deliverables-section">
      <div className="section-header">
        <h3 className="section-title">Active Deliverables</h3>
        <div className="section-actions">
          <button className="filter-btn">
            <Filter size={16} />
            Filter by Status
          </button>
          <button className="filter-btn">
            <SortAsc size={16} />
            Sort by Date
          </button>
        </div>
      </div>

      <div className="project-list-stack">
        {Array.isArray(projects) && projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="text-center py-4 text-muted small">No active deliverables found</div>
        )}
      </div>
    </section>
  );
};

export default ProjectDeliverables;
