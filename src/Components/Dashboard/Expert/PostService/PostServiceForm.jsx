import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Code2, Eye, MoreHorizontal, Database, Workflow, 
  CheckCircle2
} from "lucide-react";

import OverviewStep from './Steps/OverviewStep';
import PricingStep from './Steps/PricingStep';
import DescriptionStep from './Steps/DescriptionStep';
import MediaStep from './Steps/MediaStep';
import ServicePreview from './ServicePreview';
import { publishService } from '../../../../Services/serviceService';

import './PostService.css';

const categories = [
  { id: "nlp", title: "NLP & LLMs", icon: Bot },
  { id: "vision", title: "Computer Vision", icon: Eye },
  { id: "data", title: "Data Science", icon: Database },
  { id: "automation", title: "Automation", icon: Workflow },
  { id: "integration", title: "AI Integration", icon: Code2 },
  { id: "other", title: "Other", icon: MoreHorizontal },
];

const PostServiceForm = ({ currentStep, setCurrentStep }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "nlp",
    description: "",
    tags: [],
    faqs: [{ question: "", answer: "" }],
    tiers: {
      basic: { price: "", delivery: "3", revisions: "1", features: ["Basic AI Model Setup"] },
      standard: { price: "", delivery: "7", revisions: "3", features: ["Advanced Fine-tuning", "Documentation"] },
      premium: { price: "", delivery: "14", revisions: "Unlimited", features: ["Full Integration", "1 Month Support", "Source Code"] }
    },
    images: [],
    videoLink: ""
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handlePublish = async () => {
    const validationErrors = [];
    if (!formData.title || formData.title.trim() === '') {
      validationErrors.push('Title is required (Step 1 - Overview)');
    }
    if (!formData.tiers.basic.price || parseFloat(formData.tiers.basic.price) <= 0) {
      validationErrors.push('Basic tier price must be a positive number (Step 2 - Pricing)');
    }
    if (!formData.description || formData.description.trim().length < 120) {
      validationErrors.push('Description must be at least 120 characters (Step 3 - Description)');
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const serviceData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: formData.tiers.basic.price,
        deliveryDays: formData.tiers.basic.delivery,
        tiers: formData.tiers,
        faqs: formData.faqs,
        images: formData.images,
        videoLink: formData.videoLink
      };

      await publishService(serviceData);
      alert("Service published successfully!");
      navigate('/marketplace');
    } catch (err) {
      setError(err.message || "Failed to publish service");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OverviewStep formData={formData} setFormData={setFormData} categories={categories} />;
      case 2:
        return <PricingStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <DescriptionStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <MediaStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="expert-post-service-container">
      <div className="post-service-form-wrapper">
        <nav className="service-stepper">
          {[
            { step: 1, label: "Overview" },
            { step: 2, label: "Pricing" },
            { step: 3, label: "Description" },
            { step: 4, label: "Media" }
          ].map((item) => (
            <div key={item.step} className={`step-item ${currentStep === item.step ? 'active' : ''} ${currentStep > item.step ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > item.step ? <CheckCircle2 size={16} /> : item.step}</div>
              <span className="step-label">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="form-content-area">
          {error && <div className="error-alert mb-4" style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', whiteSpace: 'pre-line' }}>{error}</div>}
          {renderStep()}
        </div>

        <div className="form-footer-nav">
          <button className="btn-secondary" onClick={prevStep} disabled={currentStep === 1 || loading}>Back</button>
          <div className="right-btns">
            <button className="btn-ghost" disabled={loading}>Save as Draft</button>
            {currentStep < 4 ? (
              <button className="btn-primary" onClick={nextStep} disabled={loading}>Save & Continue</button>
            ) : (
              <button className="btn-success" onClick={handlePublish} disabled={loading}>
                {loading ? "Publishing..." : "Publish Service"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ServicePreview formData={formData} categories={categories} />
    </div>
  );
};

export default PostServiceForm;
