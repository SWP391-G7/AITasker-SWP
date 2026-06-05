import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitClientOnboarding } from "../../Services/onboardingService";
import "./Onboarding.css";

function ClientOnboardingForm({ onBack }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    
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

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn">
          Continue
        </button>
      </form>
    </div>
  );
}

export default ClientOnboardingForm;