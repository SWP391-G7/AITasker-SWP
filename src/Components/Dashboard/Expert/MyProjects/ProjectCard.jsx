import React from 'react';
import { Calendar, User, DollarSign, Layers, ChevronRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const getStatusStyle = (type) => {
    switch (type) {
      case 'active':
        return { color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'review':
        return { color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'urgent':
        return { color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.2)' };
      default:
        return { color: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.12)', border: '1px solid rgba(148, 163, 184, 0.2)' };
    }
  };

  return (
    <div className="project-card-item">
      <div className="project-card-graphic">
        {/* Abstract AI Graphic simulation */}
        <div className="abstract-ai-graphic">
          <div className="dot"></div>
          <div className="line"></div>
          <div className="dot"></div>
          <div className="line"></div>
        </div>
      </div>
      
      <div className="project-card-main">
        <div className="project-card-header">
          <div>
            <h4 className="project-name">{project.name}</h4>
            <div className="project-client">
              <User size={14} />
              <span>{project.client}</span>
            </div>
          </div>
          <div className="project-status-badge" style={getStatusStyle(project.statusType)}>
            {project.status}
          </div>
        </div>

        <div className="project-card-details">
          <div className="detail-item">
            <Layers size={14} />
            <span>Milestone {project.milestone}</span>
          </div>
          <div className="detail-item">
            <Calendar size={14} />
            <span>{project.deadline}</span>
          </div>
          <div className="detail-item">
            <DollarSign size={14} />
            <span>{project.price}</span>
          </div>
        </div>

        <div className="project-progress-container">
          <div className="progress-info">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="expert-progress">
            <span style={{ width: `${project.progress}%` }}></span>
          </div>
        </div>
      </div>

      <button className="project-card-action">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default ProjectCard;
