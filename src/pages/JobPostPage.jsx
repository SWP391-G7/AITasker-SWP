import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Dashboard/Sidebar";
import DashboardHeader from "../Components/Dashboard/DashboardHeader";
import { createJobPost } from "../Services/jobService";
import { getStoredUser } from "../Services/checkLogin";
import "./JobPostPage.css";

function JobPostPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getStoredUser();
    const role = user?.role || "client";
    if (role !== "client" && role !== "admin") {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    requiredSkill: "",
    durationDays: "",
    deadline: "",
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
      errors.title = "Job title is required";
    } else if (formData.title.length > 255) {
      errors.title = "Title cannot exceed 255 characters";
    }

    if (formData.budgetMin && (isNaN(Number(formData.budgetMin)) || Number(formData.budgetMin) < 0)) {
      errors.budgetMin = "Minimum budget must be a positive number";
    }

    if (formData.budgetMax && (isNaN(Number(formData.budgetMax)) || Number(formData.budgetMax) < 0)) {
      errors.budgetMax = "Maximum budget must be a positive number";
    }

    if (formData.budgetMin && formData.budgetMax && Number(formData.budgetMax) < Number(formData.budgetMin)) {
      errors.budgetMax = "Maximum budget cannot be less than minimum budget";
    }

    if (formData.durationDays && (isNaN(Number(formData.durationDays)) || Number(formData.durationDays) <= 0)) {
      errors.durationDays = "Duration must be a positive number of days";
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        errors.deadline = "Invalid deadline date";
      } else if (deadlineDate <= new Date()) {
        errors.deadline = "Deadline must be in the future";
      }
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

      // Format payload (convert empty fields to null)
      const payload = {
        title: formData.title,
        description: formData.description || null,
        budgetMin: formData.budgetMin !== "" ? Number(formData.budgetMin) : null,
        budgetMax: formData.budgetMax !== "" ? Number(formData.budgetMax) : null,
        requiredSkill: formData.requiredSkill || null,
        durationDays: formData.durationDays !== "" ? Number(formData.durationDays) : null,
        deadline: formData.deadline || null,
      };

      await createJobPost(payload);
      
      // Success redirection with state
      navigate("/client/dashboard", { 
        state: { 
          message: "post successfully", 
          type: "success" 
        } 
      });
    } catch (err) {
      console.error("Job posting failed:", err);
      // Failure redirection with state as per workflow requirements
      navigate("/client/dashboard", { 
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
    navigate("/client/dashboard");
  };

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <DashboardHeader 
          title="Post a New Job" 
          subtitle="Hire elite experts and deploy autonomous AI agents to build your projects." 
        />

        <div className="job-post-container">
          <form className="job-post-form" onSubmit={handleSubmit}>
            <div className="form-section-header">
              <h2>Job Details</h2>
              <p>Provide the scope, budget, and guidelines for your job posting.</p>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label htmlFor="title">Job Title <span className="required-star">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="e.g. Develop a LangChain-based AI Agent for Document QA"
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
                <label htmlFor="description">Job Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the responsibilities, deliverables, skills required, and workflow expectations for this project."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-field">
                <label htmlFor="budgetMin">Minimum Budget ($)</label>
                <input
                  type="number"
                  id="budgetMin"
                  name="budgetMin"
                  placeholder="e.g. 500"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="0"
                  className={validationErrors.budgetMin ? "error-input" : ""}
                />
                {validationErrors.budgetMin && <span className="field-error">{validationErrors.budgetMin}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="budgetMax">Maximum Budget ($)</label>
                <input
                  type="number"
                  id="budgetMax"
                  name="budgetMax"
                  placeholder="e.g. 1500"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="0"
                  className={validationErrors.budgetMax ? "error-input" : ""}
                />
                {validationErrors.budgetMax && <span className="field-error">{validationErrors.budgetMax}</span>}
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-field">
                <label htmlFor="requiredSkill">Required Skill</label>
                <input
                  type="text"
                  id="requiredSkill"
                  name="requiredSkill"
                  placeholder="e.g. Python, NLP, ReactJS"
                  value={formData.requiredSkill}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="durationDays">Project Duration (Days)</label>
                <input
                  type="number"
                  id="durationDays"
                  name="durationDays"
                  placeholder="e.g. 30"
                  value={formData.durationDays}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  min="1"
                  className={validationErrors.durationDays ? "error-input" : ""}
                />
                {validationErrors.durationDays && <span className="field-error">{validationErrors.durationDays}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="deadline">Application Deadline</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={validationErrors.deadline ? "error-input" : ""}
                />
                {validationErrors.deadline && <span className="field-error">{validationErrors.deadline}</span>}
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
                {isSubmitting ? "Posting Job..." : "Publish Job Post"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default JobPostPage;
