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
      <div className="pricing-tiers-container">
        <div className="tier-column basic">
          <div className="tier-header">
            <h4>PRICE</h4>
          </div>
          <div className="tier-inputs">
            <div className="price-input">
              <span>$</span>
              <input 
                type="number" 
                placeholder="Price" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="select-group">
              <Clock size={14} />
              <select 
                value={formData.delivery}
                onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
              >
                <option value="3">3 Days Delivery</option>
                <option value="7">7 Days Delivery</option>
                <option value="14">14 Days Delivery</option>
                <option value="30">30 Days Delivery</option>
              </select>
            </div>
            <div className="select-group">
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
            <div className="features-list">
              <label className="sub-label">DELIVERABLES</label>
              {formData.features.map((feat, idx) => (
                <div key={idx} className="feature-input-group">
                  <input 
                    type="text" 
                    value={feat} 
                    placeholder="Add deliverable..."
                    onChange={(e) => updateFeature(idx, e.target.value)}
                  />
                  <button onClick={() => removeFeature(idx)} className="remove-btn"><Trash2 size={12} /></button>
                </div>
              ))}
              <button className="add-feat-btn" onClick={addFeature}><Plus size={14} /> Add Feature</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingStep;
