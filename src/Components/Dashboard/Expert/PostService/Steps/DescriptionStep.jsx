import React from 'react';
import { Plus, Trash2 } from "lucide-react";

const DescriptionStep = ({ formData, setFormData }) => {
  const addFAQ = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] });
  };

  const updateFAQ = (index, field, value) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index][field] = value;
    setFormData({ ...formData, faqs: updatedFAQs });
  };

  const removeFAQ = (index) => {
    setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
  };

  return (
    <div className="form-section fade-in">
      <h3 className="section-title">Detailed Description</h3>
      <div className="form-group">
        <label>DESCRIBE YOUR SERVICE</label>
        <textarea 
          placeholder="Introduce your service, your process, and why clients should choose you..."
          className="rich-textarea"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        ></textarea>
        <p className="help-text">Min. 120 characters. Be as detailed as possible.</p>
      </div>
      
      <div className="form-group">
        <label>FREQUENTLY ASKED QUESTIONS</label>
        <div className="faq-list">
          {formData.faqs.map((faq, idx) => (
            <div key={idx} className="faq-item-card">
              <div className="faq-header">
                <span>FAQ #{idx + 1}</span>
                <button onClick={() => removeFAQ(idx)} className="text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Add a Question: e.g., Do you provide source code?" 
                value={faq.question}
                onChange={(e) => updateFAQ(idx, 'question', e.target.value)}
              />
              <textarea 
                placeholder="Add an Answer" 
                value={faq.answer}
                onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
              ></textarea>
            </div>
          ))}
        </div>
        <button className="add-faq-btn" onClick={addFAQ}><Plus size={16} /> Add FAQ</button>
      </div>
    </div>
  );
};

export default DescriptionStep;
