import React, { useState } from 'react';
import { Plus, Trash2 } from "lucide-react";
import AIExtendButton from '../../../../AIExtendButton';
import AISkeletonLoader from '../../../../AISkeletonLoader';
import Toast from '../../../../Toast';

const DescriptionStep = ({ formData, setFormData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [toastError, setToastError] = useState("");

  const handleExtendSuccess = (data) => {
    let parsedTags = [];
    if (typeof data.tags === 'string') {
      parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
      tags: parsedTags.length > 0 ? parsedTags : prev.tags,
    }));
    setIsGenerating(false);
    setIsAiOptimized(true);
  };
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
    <div className="form-section fade-in" style={{ position: "relative" }}>
      {isGenerating && <AISkeletonLoader message="AI Engine is designing your service description..." />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 className="section-title" style={{ margin: 0 }}>Detailed Description</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAiOptimized && (
            <span className="ai-sparkle-badge">
              ✨ AI Optimized
            </span>
          )}
          <AIExtendButton
            draftFields={[formData.title, formData.description]}
            onExtendStart={() => {
              setIsGenerating(true);
              setIsAiOptimized(false);
            }}
            onExtendSuccess={handleExtendSuccess}
            onExtendFailure={() => setIsGenerating(false)}
            type="service_description"
            onErrorToast={(msg) => setToastError(msg)}
          />
        </div>
      </div>
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
      {toastError && <Toast message={toastError} onClose={() => setToastError("")} />}
    </div>
  );
};

export default DescriptionStep;
