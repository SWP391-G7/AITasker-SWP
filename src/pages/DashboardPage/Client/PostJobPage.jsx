import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Code2,
  Eye,
  MoreHorizontal,
  Database,
  Workflow,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { createJobPost } from "../../../Services/jobService";
import AIExtendButton from "../../../Components/AIExtendButton";
import AISkeletonLoader from "../../../Components/AISkeletonLoader";
import Toast from "../../../Components/Toast";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

const categories = [
  { id: "NLP & LLMs", title: "NLP & LLMs", icon: Bot },
  { id: "Computer Vision", title: "Computer Vision", icon: Eye },
  { id: "Data Science", title: "Data Science", icon: Database },
  { id: "Automation", title: "Automation", icon: Workflow },
  { id: "AI Integration", title: "AI Integration", icon: Code2 },
  { id: "Other", title: "Other", icon: MoreHorizontal },
];

function PostJobPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    techStack: "",
    requirements: "",
    budgetMin: "",
    budgetMax: "",
    durationDays: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [toastError, setToastError] = useState("");

  const handleExtendSuccess = (data) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
      techStack: data.skills || prev.techStack,
      requirements: data.requirements || prev.requirements,
    }));
    setIsGenerating(false);
    setIsAiOptimized(true);
  };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const user = useClientUser();

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCategorySelect = (category) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (!formData.title.trim()) {
        setError("Please enter project title.");
        return false;
      }

      if (!formData.category) {
        setError("Please select a service category.");
        return false;
      }

      if (!formData.description.trim()) {
        setError("Please enter project description.");
        return false;
      }

      if (formData.description.trim().length < 50) {
        setError("Project description must be at least 50 characters.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.techStack.trim()) {
        setError("Please enter tech stack.");
        return false;
      }

      if (!formData.requirements.trim()) {
        setError("Please enter project requirements.");
        return false;
      }
    }

    if (step === 3) {
      const minNum = Number(formData.budgetMin);
      const maxNum = Number(formData.budgetMax);

      if (!formData.budgetMin || isNaN(minNum) || minNum <= 0) {
        setError("Please enter a valid minimum budget.");
        return false;
      }

      if (!formData.budgetMax || isNaN(maxNum) || maxNum <= 0) {
        setError("Please enter a valid maximum budget.");
        return false;
      }

      if (maxNum < minNum) {
        setError("Maximum budget cannot be less than the minimum budget.");
        return false;
      }

      const durNum = Number(formData.durationDays);
      if (!formData.durationDays || isNaN(durNum) || durNum <= 0 || !Number.isInteger(durNum)) {
        setError("Please enter a valid project duration in days.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {

    if (!validateStep()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await createJobPost({
        title: formData.title.trim(),
        description: `${formData.description.trim()}`,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        durationDays: Number(formData.durationDays),
        requiredSkill: formData.techStack.trim() || formData.category,
      });

      setSuccess("Task posted successfully.");

      setTimeout(() => {
        navigate("/client/projects");
      }, 800);
    } catch (err) {
      setError(err.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="post-job" />

      <main className="post-job-main">
        <ClientHeader
          title="Post a New Task"
          subtitle="Connect with elite AI experts to bring your vision to life."
          headerActions={
            <button
              type="button"
              className="client-header-action"
              onClick={() => navigate("/client/dashboard")}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="post-stepper">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span>
            <strong>BASICS</strong>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span>
            <strong>DETAILS</strong>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span>3</span>
            <strong>BUDGET</strong>
          </div>
        </section>

        <form onSubmit={(e) => e.preventDefault()}>
          <section className="post-form-card" style={{ position: "relative" }}>
            {isGenerating && <AISkeletonLoader />}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {step === 1 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isAiOptimized && (
                      <span className="ai-sparkle-badge">
                        ✨ AI Optimized
                      </span>
                    )}
                  </div>
                  <AIExtendButton
                    draftFields={[formData.title, formData.description]}
                    onExtendStart={() => {
                      setIsGenerating(true);
                      setIsAiOptimized(false);
                    }}
                    onExtendSuccess={handleExtendSuccess}
                    onExtendFailure={() => setIsGenerating(false)}
                    type="job_description"
                    onErrorToast={(msg) => setToastError(msg)}
                  />
                </div>

                <div className="form-group">
                  <label>PROJECT TITLE</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Develop a Custom LLM for Legal Research"
                  />
                  <p>Make it descriptive to attract specialized talent.</p>
                </div>

                <div className="form-group">
                  <label>SERVICE CATEGORY</label>
                  <div className="category-grid">
                    {categories.map(({ id, title, icon: Icon }) => (
                      <button
                        type="button"
                        className={`category-card ${formData.category === id ? "selected" : ""}`}
                        key={id}
                        onClick={() => handleCategorySelect(id)}
                      >
                        <Icon size={28} />
                        <span>{title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>PROJECT DESCRIPTION</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Outline the problem you're solving, current infrastructure, and desired outcomes..."
                  ></textarea>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label>TECH STACK</label>
                  <input
                    type="text"
                    name="techStack"
                    value={formData.techStack}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, Python, OpenAI API, PostgreSQL"
                  />
                  <p>List technologies or tools you prefer for this task.</p>
                </div>

                <div className="form-group">
                  <label>PROJECT REQUIREMENTS</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Describe features, deliverables, integrations, dataset requirements, or success criteria..."
                  ></textarea>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-row two-cols">
                  <div className="form-field">
                    <label>MINIMUM BUDGET ($)</label>
                    <input
                      type="number"
                      name="budgetMin"
                      min="1"
                      value={formData.budgetMin}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                    />
                    <p>Lowest acceptable bid amount.</p>
                  </div>

                  <div className="form-field">
                    <label>MAXIMUM BUDGET ($)</label>
                    <input
                      type="number"
                      name="budgetMax"
                      min="1"
                      value={formData.budgetMax}
                      onChange={handleChange}
                      placeholder="e.g., 1500"
                    />
                    <p>Upper limit you are willing to pay.</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>PROJECT DURATION (DAYS)</label>
                    <input
                      type="number"
                      name="durationDays"
                      min="1"
                      step="1"
                      value={formData.durationDays}
                      onChange={handleChange}
                      placeholder="e.g., 30"
                    />
                    <p>Estimated number of days to complete the project.</p>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="post-actions">
            {step === 1 ? (
              <button type="button" className="draft-btn" onClick={() => navigate("/client/dashboard")} disabled={submitting}>
                Cancel
              </button>
            ) : (
              <button type="button" className="draft-btn" onClick={handleBack} disabled={submitting}>
                Back
              </button>
            )}

            {step < 3 ? (
              <button type="button" className="next-btn" onClick={handleNext} disabled={submitting}>
                {step === 1 ? "Next: Details" : "Next: Budget"}
              </button>
            ) : (
              <button type="button" className="next-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Posting..." : "Post Task"}
              </button>
            )}
          </section>
        </form>

        <Footer variant="dashboard" />
      </main>
      {toastError && <Toast message={toastError} onClose={() => setToastError("")} />}
    </div>
  );
}

export default PostJobPage;
