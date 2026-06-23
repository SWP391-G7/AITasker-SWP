import React from 'react';
import { Clock, RefreshCcw, Plus, Trash2 } from "lucide-react";

const PricingStep = ({ formData, setFormData }) => {
  const addFeature = (tier) => {
    setFormData({
      ...formData,
      tiers: {
        ...formData.tiers,
        [tier]: {
          ...formData.tiers[tier],
          features: [...formData.tiers[tier].features, ""]
        }
      }
    });
  };

  const updateFeature = (tier, index, value) => {
    const updatedFeatures = [...formData.tiers[tier].features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      tiers: {
        ...formData.tiers,
        [tier]: {
          ...formData.tiers[tier],
          features: updatedFeatures
        }
      }
    });
  };

  const removeFeature = (tier, index) => {
    const updatedFeatures = formData.tiers[tier].features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tiers: {
        ...formData.tiers,
        [tier]: {
          ...formData.tiers[tier],
          features: updatedFeatures
        }
      }
    });
  };

  const tiers = ['basic', 'standard', 'premium'];

  return (
    <div className="form-section fade-in">
      <h3 className="section-title">Service Packages</h3>
      <div className="pricing-tiers-container">
        {tiers.map((tier) => (
          <div key={tier} className={`tier-column ${tier}`}>
            <div className="tier-header">
              <h4>{tier.toUpperCase()}</h4>
            </div>
            <div className="tier-inputs">
              <div className="price-input">
                <span>$</span>
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={formData.tiers[tier].price}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tiers: {
                      ...formData.tiers, 
                      [tier]: { ...formData.tiers[tier], price: e.target.value }
                    }
                  })}
                />
              </div>
              <div className="select-group">
                <Clock size={14} />
                <select 
                  value={formData.tiers[tier].delivery}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tiers: {
                      ...formData.tiers, 
                      [tier]: { ...formData.tiers[tier], delivery: e.target.value }
                    }
                  })}
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
                  value={formData.tiers[tier].revisions}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tiers: {
                      ...formData.tiers, 
                      [tier]: { ...formData.tiers[tier], revisions: e.target.value }
                    }
                  })}
                >
                  <option value="1">1 Revision</option>
                  <option value="3">3 Revisions</option>
                  <option value="5">5 Revisions</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>
              <div className="features-list">
                <label className="sub-label">DELIVERABLES</label>
                {formData.tiers[tier].features.map((feat, idx) => (
                  <div key={idx} className="feature-input-group">
                    <input 
                      type="text" 
                      value={feat} 
                      placeholder="Add deliverable..."
                      onChange={(e) => updateFeature(tier, idx, e.target.value)}
                    />
                    <button onClick={() => removeFeature(tier, idx)} className="remove-btn"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button className="add-feat-btn" onClick={() => addFeature(tier)}><Plus size={14} /> Add Feature</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingStep;
