/**
 * Frontend module: Components/onboarding/ClientOnboardingForm.jsx
 *
 * Vai trò: Component Client Onboarding Form: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitClientOnboarding } from "../../Services/onboardingService";
import AIExtendButton from "../AI/AIExtendButton";
import AISkeletonLoader from "../AI/AISkeletonLoader";
import Toast from "../Toast";
import "./Onboarding.css";

// React component “Client Onboarding Form” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function ClientOnboardingForm({ onBack }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [toastError, setToastError] = useState("");

  // Handler “handle extend success” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleExtendSuccess = (data) => {
    setFormData((prev) => ({
      ...prev,
      companyName: data.companyName || data.professionalTitle || prev.companyName,
      industry: data.industry || prev.industry,
      bio: data.bio || prev.bio,
    }));
    setIsGenerating(false);
    setIsAiOptimized(true);
  };

  // Handler “handle change” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // React component “validate Form” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
  const validateForm = () => {
    if (!formData.companyName.trim()) {
      return "Company name is required";
    }

    if (!formData.industry.trim()) {
      return "Industry is required";
    }

    return "";
  };

  // Handler “handle submit” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
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

      navigate("/client/dashboard")
    } catch (error) {
      setError("Submit failed. Please try again.");
    }
  };

  return (
    <div className="onboarding-card" style={{ position: "relative" }}>
      {isGenerating && <AISkeletonLoader message="AI Engine is polishing your company details..." />}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ margin: 0 }}>Company Bio</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isAiOptimized && (
                <span className="ai-sparkle-badge">
                  ✨ AI Optimized
                </span>
              )}
              <AIExtendButton
                draftFields={[formData.companyName, formData.bio]}
                onExtendStart={() => {
                  setIsGenerating(true);
                  setIsAiOptimized(false);
                }}
                onExtendSuccess={handleExtendSuccess}
                onExtendFailure={() => setIsGenerating(false)}
                type="bio"
                onErrorToast={(msg) => setToastError(msg)}
              />
            </div>
          </div>
          <textarea
            name="bio"
            rows="4"
            placeholder="Tell potential experts about your company, projects, and mission..."
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-btn">
          Continue
        </button>
      </form>
      {toastError && <Toast message={toastError} onClose={() => setToastError("")} />}
    </div>
  );
}

export default ClientOnboardingForm;