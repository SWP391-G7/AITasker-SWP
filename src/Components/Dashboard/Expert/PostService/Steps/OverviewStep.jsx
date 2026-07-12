import React from 'react';

const OverviewStep = ({ formData, setFormData }) => {
  return (
    <div className="form-section fade-in">
      <h3 className="section-title">Service Overview</h3>
      <div className="form-group">
        <label>I WILL...</label>
        <div className="input-with-prefix">
          <span>I will</span>
          <input 
            type="text" 
            placeholder="e.g., build a custom RAG system for your documentation"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <p className="help-text">Start with a strong action verb. Maximum 80 characters.</p>
      </div>

      <div className="form-group">
        <label>TECH STACK</label>
        <input
          type="text"
          value={formData.techStack}
          onChange={(e) => setFormData({...formData, techStack: e.target.value})}
          placeholder="e.g., Python, LangChain, OpenAI, Pinecone"
        />
        <p className="help-text">List technologies or tools used in this service.</p>
      </div>

      <div className="form-group">
        <label>TAGS</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
          placeholder="e.g., NLP, RAG, Automation"
        />
        <p className="help-text">Comma-separated tags to help clients find your service.</p>
      </div>
    </div>
  );
};

export default OverviewStep;
