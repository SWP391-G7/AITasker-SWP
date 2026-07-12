import React from 'react';

const ServicePreview = ({ formData }) => {
  return (
    <div className="service-preview-sidebar">
      <div className="preview-sticky">
        <h4 className="preview-label">LIVE PREVIEW</h4>
        <div className="preview-card-mock">
          <div className="mock-image" style={formData.images?.[0]?.preview ? { backgroundImage: `url(${formData.images[0].preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            <span className="mock-tag">{(formData.techStack || formData.tags || "AI").split(",")[0].trim().toUpperCase()}</span>
          </div>
          <div className="mock-body">
            <div className="mock-expert">
              <div className="mock-avatar"></div>
              <span>You (Expert)</span>
              <div className="mock-rating">5.0</div>
            </div>
            <h3 className="mock-title">
              {formData.title ? `I will ${formData.title}` : "Your service title will appear here..."}
            </h3>
          </div>
          <div className="mock-footer">
            <div className="mock-price">
              <small>STARTING AT</small>
              <strong>{formData.price ? `$${formData.price}` : "$ ---"}</strong>
            </div>
            <div className="mock-btn">View Details</div>
          </div>
        </div>
        <div className="preview-tips">
          <h5>Pro Tips</h5>
          <ul>
            <li>High-quality images increase clicks by 40%.</li>
            <li>Clear pricing helps clients decide faster.</li>
            <li>Be specific about your deliverables.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServicePreview;
