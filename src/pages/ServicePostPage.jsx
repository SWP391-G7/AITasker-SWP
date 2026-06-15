import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Dashboard/Sidebar";
import DashboardHeader from "../Components/Dashboard/DashboardHeader";
import { createService } from "../Services/serviceService";
import { getStoredUser } from "../Services/checkLogin";
import "./ServicePostPage.css";

function ServicePostPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getStoredUser();
    const role = user?.role || "client";
    if (role !== "expert" && role !== "admin") {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    pricing_type: "fixed",
    delivery_days: "",
    tags: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Service title is required";
    } else if (formData.title.length > 255) {
      errors.title = "Title cannot exceed 255 characters";
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a positive number";
    }

    const validPricingTypes = ["fixed", "hourly"];
    if (!formData.pricing_type || !validPricingTypes.includes(formData.pricing_type)) {
      errors.pricing_type = "Select a valid pricing type";
    }

    if (!formData.delivery_days || isNaN(Number(formData.delivery_days)) || Number(formData.delivery_days) <= 0) {
      errors.delivery_days = "Delivery days must be a positive number of days";
    }

    if (formData.tags && formData.tags.length > 255) {
      errors.tags = "Tags cannot exceed 255 characters";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationErrors({});

      const payload = {
        title: formData.title,
        description: formData.description || null,
        price: Number(formData.price),
        pricing_type: formData.pricing_type,
        delivery_days: Number(formData.delivery_days),
        tags: formData.tags || null,
      };

      await createService(payload);
      
      // Success redirection back to expert dashboard
      navigate("/expert/dashboard", { 
        state: { 
          message: "post successfully", 
          type: "success" 
        } 
      });
    } catch (err) {
      console.error("Service posting failed:", err);
      // Failure redirection back to expert dashboard
      navigate("/expert/dashboard", { 
        state: { 
          message: "post not successfully", 
          type: "danger" 
        } 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/expert/dashboard");
  };

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <DashboardHeader 
          title="Post a New Service" 
          subtitle="Advertise your expert AI skills and offer packages directly to global clients." 
        />

        <div className="service-post-container">
          <form className="service-post-form" onSubmit={handleSubmit}>
            <div className="form-section-header">
              <h2>Service Information</h2>
              <p>Provide description, delivery terms, and rates for your service listing.</p>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label htmlFor="title">Service Title <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g. Set up a Custom RAG pipeline using Pinecone & OpenAI"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={validationErrors.title ? "error-input" : ""}
                />
                {validationErrors.title && <span className="field-error">{validationErrors.title}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label htmlFor="description">Service Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Detailed description of what deliverables are included in this package..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-field">
                <label htmlFor="price">Price ($) <span className="required-star">*</span></label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="e.g. 250"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="0"
                  className={validationErrors.price ? "error-input" : ""}
                />
                {validationErrors.price && <span className="field-error">{validationErrors.price}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="pricing_type">Pricing Type <span className="required-star">*</span></label>
                <select
                  id="pricing_type"
                  name="pricing_type"
                  value={formData.pricing_type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="form-select-pricing"
                >
                  <option value="fixed">Fixed Rate</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
                {validationErrors.pricing_type && <span className="field-error">{validationErrors.pricing_type}</span>}
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-field">
                <label htmlFor="delivery_days">Delivery Days <span className="required-star">*</span></label>
                <input
                  type="number"
                  id="delivery_days"
                  name="delivery_days"
                  placeholder="e.g. 5"
                  value={formData.delivery_days}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="1"
                  className={validationErrors.delivery_days ? "error-input" : ""}
                />
                {validationErrors.delivery_days && <span className="field-error">{validationErrors.delivery_days}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="tags">Tags (Comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="e.g. Pinecone, RAG, Python"
                  value={formData.tags}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions-row">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn glow-hover" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting Service..." : "Publish Service"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ServicePostPage;
