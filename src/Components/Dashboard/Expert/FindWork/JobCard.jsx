import React from 'react';
import { Hexagon, Eye, MessageSquare, Database, Clock, Briefcase } from 'lucide-react';

const JobCard = ({ job }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'hexagon': return <Hexagon size={24} className="job-type-icon" />;
      case 'eye': return <Eye size={24} className="job-type-icon" />;
      case 'message': return <MessageSquare size={24} className="job-type-icon" />;
      case 'database': return <Database size={24} className="job-type-icon" />;
      default: return <Briefcase size={24} className="job-type-icon" />;
    }
  };

  return (
    <div className={`job-listing-card ${job.isFeatured ? 'featured-card' : ''}`}>
      {job.isFeatured && <span className="featured-badge">FEATURED</span>}
      <span className="posted-time-badge">{job.postedAt}</span>

      <div className="job-card-top">
        <div className="job-icon-box">
          {getIcon(job.iconType)}
        </div>
        <div className="job-title-area">
          <h3 className="job-listing-title">{job.title}</h3>
          <p className="job-listing-company">{job.company}</p>
        </div>
      </div>

      <p className="job-listing-description">{job.description}</p>

      <div className="job-listing-tags">
        {job.tags.map((tag, idx) => (
          <span key={idx} className="job-listing-tag">{tag}</span>
        ))}
      </div>

      <div className="job-card-footer">
        <div className="job-listing-meta">
          <div className="meta-price">{job.budget}</div>
          <div className="meta-duration">
            <Clock size={14} />
            {job.duration}
          </div>
        </div>
        <button className={`job-action-btn ${job.buttonType === 'solid' ? 'btn-solid' : 'btn-outline'}`}>
          {job.buttonText}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
