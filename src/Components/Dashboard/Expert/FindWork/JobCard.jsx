import React from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, Star } from 'lucide-react';

const JobCard = ({ job }) => {
  return (
    <div className="job-card-item">
      <div className="job-card-header">
        <div className="job-card-title-box">
          <h3 className="job-title">{job.title}</h3>
          <div className="job-company-info">
            <span className="job-company">{job.company}</span>
            <span className="job-rating">
              <Star size={12} fill="#fbbf24" color="#fbbf24" />
              4.9 (120 reviews)
            </span>
          </div>
        </div>
        <div className="job-budget-badge">
          <DollarSign size={14} />
          {job.budget}
        </div>
      </div>

      <p className="job-description">{job.description}</p>

      <div className="job-tags">
        {job.tags.map((tag, index) => (
          <span key={index} className="job-tag">{tag}</span>
        ))}
      </div>

      <div className="job-footer">
        <div className="job-meta">
          <span className="meta-item">
            <MapPin size={14} />
            {job.location}
          </span>
          <span className="meta-item">
            <Briefcase size={14} />
            {job.type}
          </span>
          <span className="meta-item">
            <Clock size={14} />
            {job.postedAt}
          </span>
        </div>
        <button className="apply-btn">Apply Now</button>
      </div>
    </div>
  );
};

export default JobCard;
