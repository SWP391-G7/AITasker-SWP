import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2
} from "lucide-react";

import OverviewStep from './Steps/OverviewStep';
import PricingStep from './Steps/PricingStep';
import DescriptionStep from './Steps/DescriptionStep';
import MediaStep from './Steps/MediaStep';
import ServicePreview from './ServicePreview';
import { publishService } from '../../../../Services/serviceService';
import { uploadImage } from '../../../../Services/uploadService';

import './PostService.css';

const PostServiceForm = ({ currentStep, setCurrentStep }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    techStack: "",
    tags: "",
    description: "",
    faqs: [{ question: "", answer: "" }],
    price: "",
    delivery: "3",
    revisions: "1",
    features: ["Basic AI Model Setup"],
    images: [],
    videoLink: ""
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handlePublish = async () => {
    const validationErrors = [];
    if (!formData.title || formData.title.trim() === '') {
      validationErrors.push('Title is required (Step 1 - Basics)');
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      validationErrors.push('Price must be a positive number (Step 3 - Budget)');
    }
    if (!formData.description || formData.description.trim().length < 120) {
      validationErrors.push('Description must be at least 120 characters (Step 2 - Details)');
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const imageUrls = [];
      for (const img of formData.images) {
        if (img.file) {
          const url = await uploadImage(img.file);
          imageUrls.push(url);
        }
      }

      const serviceData = {
        title: formData.title,
        techStack: formData.techStack,
        tags: formData.tags,
        description: formData.description,
        price: formData.price,
        deliveryDays: formData.delivery,
        faqs: formData.faqs,
        images: JSON.stringify(imageUrls),
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
        return <OverviewStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <DescriptionStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <PricingStep formData={formData} setFormData={setFormData} />;
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
            { step: 1, label: "Basics" },
            { step: 2, label: "Details" },
            { step: 3, label: "Budget" },
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

      <ServicePreview formData={formData} />
    </div>
  );
};

export default PostServiceForm;
