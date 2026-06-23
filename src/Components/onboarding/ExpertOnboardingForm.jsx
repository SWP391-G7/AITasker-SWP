import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitExpertOnboarding } from "../../Services/onboardingService";
import "./Onboarding.css";

function ExpertOnboardingForm({ onBack }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    professionalTitle: "",
    skills: "",
    experience: "",
    portfolioUrl: "",
    hourlyRate: "",
    bio: "",
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
    if (!formData.professionalTitle.trim()) {
      return "Professional title is required";
    }

    if (!formData.skills.trim()) {
      return "Skills are required";
    }

    if (!formData.experience.trim()) {
      return "Experience is required";
    }

    if (!formData.hourlyRate.trim()) {
      return "Hourly rate is required";
    }

    if (Number(formData.hourlyRate) <= 0) {
      return "Hourly rate must be greater than 0";
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

      const result = await submitExpertOnboarding(formData);

      console.log("Expert onboarding success:", result);

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

      <h1>Expert Onboarding</h1>
      <p>Tell us about your expertise.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Professional title</label>
          <input
            type="text"
            name="professionalTitle"
            placeholder="Example: AI Engineer"
            value={formData.professionalTitle}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Main skills</label>
          <input
            type="text"
            name="skills"
            placeholder="Example: ChatGPT, Python, Data Analysis"
            value={formData.skills}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Years of experience</label>
          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          >
            <option value="">Select experience</option>
            <option value="0-1">0 - 1 year</option>
            <option value="1-3">1 - 3 years</option>
            <option value="3-5">3 - 5 years</option>
            <option value="over-5">Over 5 years</option>
          </select>
        </div>

        <div className="form-field">
          <label>Portfolio URL</label>
          <input
            type="url"
            name="portfolioUrl"
            placeholder="https://your-portfolio.com"
            value={formData.portfolioUrl}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Hourly rate</label>
          <input
            type="number"
            name="hourlyRate"
            placeholder="Example: 20"
            value={formData.hourlyRate}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Short bio</label>
          <textarea
            name="bio"
            placeholder="Introduce yourself..."
            value={formData.bio}
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

export default ExpertOnboardingForm;