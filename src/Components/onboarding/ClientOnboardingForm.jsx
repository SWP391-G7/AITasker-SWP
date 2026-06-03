import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitClientOnboarding } from "../../Services/onboardingService";
import "./Onboarding.css";

function ClientOnboardingForm({ onBack }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    projectNeed: "",
    budgetRange: "",
    timeline: "",
    description: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      return "Company name is required";
    }

    if (!formData.industry.trim()) {
      return "Industry is required";
    }

    if (!formData.projectNeed.trim()) {
      return "AI task type is required";
    }

    if (!formData.budgetRange.trim()) {
      return "Budget range is required";
    }

    if (!formData.timeline.trim()) {
      return "Timeline is required";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validateError = validateForm();

    if (validateError) {
      setError(validateError);
      return;
    }

    try {
      setError("");

      const result = await submitClientOnboarding(formData);

      console.log("Client onboarding success:", result);

      navigate("/dashboard");
    } catch (error) {
      setError("Submit failed. Please try again.");
    }
  };

  return (
    <div className="onboarding-card">
      <button type="button" className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h1>Client Onboarding</h1>
      <p>Tell us about your project needs.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Company name</label>
          <input
            type="text"
            name="companyName"
            placeholder="Example: AITasker Company"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Industry</label>
          <input
            type="text"
            name="industry"
            placeholder="Example: Education, Finance, Healthcare"
            value={formData.industry}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>AI task type</label>
          <select
            name="projectNeed"
            value={formData.projectNeed}
            onChange={handleChange}
          >
            <option value="">Select task type</option>
            <option value="chatbot">Chatbot Development</option>
            <option value="data-analysis">Data Analysis</option>
            <option value="automation">Automation</option>
            <option value="computer-vision">Computer Vision</option>
            <option value="content-generation">Content Generation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-field">
          <label>Budget range</label>
          <select
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
          >
            <option value="">Select budget</option>
            <option value="under-100">Under $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-1000">$500 - $1000</option>
            <option value="over-1000">Over $1000</option>
          </select>
        </div>

        <div className="form-field">
          <label>Expected timeline</label>
          <input
            type="text"
            name="timeline"
            placeholder="Example: 2 weeks"
            value={formData.timeline}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Project description</label>
          <textarea
            name="description"
            placeholder="Describe your project..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn">
          Continue
        </button>
      </form>
    </div>
  );
}

export default ClientOnboardingForm;