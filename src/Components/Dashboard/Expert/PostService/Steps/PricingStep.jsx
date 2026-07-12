import React from 'react';
import { Clock, RefreshCcw, Plus, Trash2 } from "lucide-react";

const PricingStep = ({ formData, setFormData }) => {
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""]
    });
  };

  const updateFeature = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="form-section fade-in">
      <h3 className="section-title">Pricing</h3>
      <div className="form-row two-cols">
        <div className="form-field">
          <label>PRICE ($)</label>
          <input 
            type="number" 
            placeholder="e.g., 150"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <p className="help-text">Set a fixed price for this service.</p>
        </div>
        <div className="form-field">
          <label>DELIVERY TIME</label>
          <div className="select-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={14} />
            <select 
              value={formData.delivery}
              onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
            >
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>REVISIONS</label>
        <div className="select-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCcw size={14} />
          <select
            value={formData.revisions}
            onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
          >
            <option value="1">1 Revision</option>
            <option value="3">3 Revisions</option>
            <option value="5">5 Revisions</option>
            <option value="Unlimited">Unlimited</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>DELIVERABLES</label>
        {formData.features.map((feat, idx) => (
          <div key={idx} className="feature-input-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              type="text" 
              value={feat} 
              placeholder="Add deliverable..."
              onChange={(e) => updateFeature(idx, e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={() => removeFeature(idx)} className="remove-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
          </div>
        ))}
        <button className="add-feat-btn" onClick={addFeature} style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={14} /> Add Deliverable</button>
      </div>
    </div>
  );
};

export default PricingStep;
