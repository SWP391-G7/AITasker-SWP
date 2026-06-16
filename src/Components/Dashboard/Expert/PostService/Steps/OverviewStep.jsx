import React from 'react';

const OverviewStep = ({ formData, setFormData, categories }) => {
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
        <label>CATEGORY</label>
        <div className="category-selection-grid">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`cat-toggle ${formData.category === cat.id ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, category: cat.id})}
            >
              <cat.icon size={20} />
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewStep;
