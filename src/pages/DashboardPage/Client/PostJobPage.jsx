import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Camera, Video, AlertCircle, CheckCircle2 } from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { createJobPost } from "../../../Services/jobService";
import AIExtendButton from "../../../Components/AIExtendButton";
import AISkeletonLoader from "../../../Components/AISkeletonLoader";
import Toast from "../../../Components/Toast";
import { uploadImage } from "../../../Services/uploadService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";
import "../../../Components/Dashboard/Expert/PostService/PostService.css";

function PostJobPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    tags: "",
    requirements: "",
    budgetMin: "",
    budgetMax: "",
    durationDays: "",
    images: [],
    videoLink: "",
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
  const [notifications, setNotifications] = useState(0);
  const user = useClientUser();

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (!formData.title.trim()) {
        setError("Please enter project title.");
        return false;
      }

      if (!formData.techStack.trim()) {
        setError("Please enter tech stack.");
        return false;
      }

      if (formData.description.trim().length < 50) {
        setError("Project description must be at least 50 characters.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        setError("Please enter project description.");
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
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {

    if (!validateStep()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const imageUrls = [];
      for (const img of formData.images) {
        if (img.file) {
          const url = await uploadImage(img.file);
          imageUrls.push(url);
        }
      }

      await createJobPost({
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        durationDays: Number(formData.durationDays),
        requiredSkill: formData.techStack.split(',').map(t => t.trim()).filter(Boolean).join(', '),
        tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).join(','),
        images: JSON.stringify(imageUrls),
        videoLink: formData.videoLink,
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

        <div className="expert-post-service-container">
          <div className="post-service-form-wrapper">
            <section className="post-stepper">
              {[
                { step: 1, label: "BASICS" },
                { step: 2, label: "DETAILS" },
                { step: 3, label: "BUDGET" },
                { step: 4, label: "MEDIA" },
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <div className={`step ${step >= item.step ? "active" : ""}`}>
                    <span>{step > item.step ? <CheckCircle2 size={16} /> : item.step}</span>
                    <strong>{item.label}</strong>
                  </div>
                  {idx < 3 && <div className="step-line"></div>}
                </React.Fragment>
              ))}
            </section>

        <form onSubmit={(e) => e.preventDefault()}>
          <section className="post-form-card" style={{ position: "relative" }}>
            {isGenerating && <AISkeletonLoader />}
            {error && <div className="error-alert mb-4" style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', whiteSpace: 'pre-line' }}>{error}</div>}
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
                    maxLength={255}
                    placeholder="e.g., Develop a Custom LLM for Legal Research"
                  />
                  <p>Make it descriptive to attract specialized talent.</p>
                </div>

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
                  <label>TAGS</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., NLP, Computer Vision, Automation"
                  />
                  <p>Comma-separated tags to help experts find your task.</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label>PROJECT DESCRIPTION</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Outline the problem you're solving, current infrastructure, and desired outcomes..."
                  ></textarea>
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

            {step === 4 && (
              <>
                <div className="form-section fade-in">
                  <h3 className="section-title">Task Gallery</h3>

                  <div className="media-guidelines">
                    <div className="guideline-item">
                      <AlertCircle size={16} />
                      <span>Upload images that help experts understand your task. (Max 3)</span>
                    </div>
                  </div>

                  <div className="upload-grid-enhanced">
                    {formData.images && formData.images[0] ? (
                      <div className="preview-box main">
                        <img src={formData.images[0].preview} alt="Primary" />
                        <button className="remove-media-btn" onClick={() => {
                          URL.revokeObjectURL(formData.images[0].preview);
                          const updated = formData.images.filter((_, i) => i !== 0);
                          setFormData({ ...formData, images: updated });
                        }}><Trash2 size={16} /></button>
                        <div className="media-tag">PRIMARY</div>
                      </div>
                    ) : (
                      <div className="upload-box main" onClick={() => fileInputRef.current.click()}>
                        <div className="upload-icon-circle">
                          <Camera size={32} />
                        </div>
                        <span>Upload Main Image</span>
                        <p>High resolution (1280x720) recommended</p>
                      </div>
                    )}

                    {formData.images && formData.images[1] ? (
                      <div className="preview-box">
                        <img src={formData.images[1].preview} alt="Gallery 1" />
                        <button className="remove-media-btn" onClick={() => {
                          URL.revokeObjectURL(formData.images[1].preview);
                          const updated = formData.images.filter((_, i) => i !== 1);
                          setFormData({ ...formData, images: updated });
                        }}><Trash2 size={14} /></button>
                      </div>
                    ) : (
                      <div className="upload-box small" onClick={() => fileInputRef.current.click()}>
                        <Plus size={24} />
                        <span>Add Image</span>
                      </div>
                    )}

                    {formData.images && formData.images[2] ? (
                      <div className="preview-box">
                        <img src={formData.images[2].preview} alt="Gallery 2" />
                        <button className="remove-media-btn" onClick={() => {
                          URL.revokeObjectURL(formData.images[2].preview);
                          const updated = formData.images.filter((_, i) => i !== 2);
                          setFormData({ ...formData, images: updated });
                        }}><Trash2 size={14} /></button>
                      </div>
                    ) : (
                      <div className="upload-box small" onClick={() => fileInputRef.current.click()}>
                        <Plus size={24} />
                        <span>Add Image</span>
                      </div>
                    )}

                    <input 
                      type="file" 
                      hidden 
                      ref={fileInputRef} 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (!files.length) return;
                        const newImages = files.map(file => ({
                          file,
                          preview: URL.createObjectURL(file),
                        }));
                        setFormData({
                          ...formData,
                          images: [...(formData.images || []), ...newImages].slice(0, 3)
                        });
                      }} 
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Video size={16} style={{ color: '#60a5fa' }} />
                      VIDEO DEMO (OPTIONAL)
                    </label>
                    <div className="video-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Paste YouTube, Vimeo or Loom URL here..." 
                        className="video-url-input"
                        value={formData.videoLink || ""}
                        onChange={(e) => setFormData({...formData, videoLink: e.target.value})}
                      />
                    </div>
                    <p className="help-text">Videos help experts understand your requirements better.</p>
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

            {step < 4 ? (
              <button type="button" className="next-btn" onClick={handleNext} disabled={submitting}>
                {step === 1 ? "Next: Description" : step === 2 ? "Next: Budget" : "Next: Media"}
              </button>
            ) : (
              <button type="button" className="next-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Posting..." : "Post Task"}
              </button>
            )}
          </section>
        </form>
          </div>

          <aside className="service-preview-sidebar">
            <div className="preview-sticky">
              <h4 className="preview-label">LIVE PREVIEW</h4>
              <div className="preview-card-mock">
                <div className="mock-image" style={formData.images?.[0]?.preview ? { backgroundImage: `url(${formData.images[0].preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  <span className="mock-tag">{(formData.techStack || formData.tags || "TASK").split(",")[0].trim().toUpperCase()}</span>
                </div>
                <div className="mock-body">
                  <div className="mock-expert">
                    <div className="mock-avatar"></div>
                    <span>You (Client)</span>
                    <div className="mock-rating">{formData.durationDays || "—"} days</div>
                  </div>
                  <h3 className="mock-title">
                    {formData.title || "Your task title will appear here..."}
                  </h3>
                  <p className="mock-description" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.5rem' }}>
                    {formData.description ? formData.description.substring(0, 120) + (formData.description.length > 120 ? '...' : '') : "No description yet."}
                  </p>
                </div>
                <div className="mock-footer">
                  <div className="mock-price">
                    <small>TASK BUDGET</small>
                    <strong>${Number(formData.budgetMin || 0).toLocaleString()} - ${Number(formData.budgetMax || 0).toLocaleString()}</strong>
                  </div>
                  <div className="mock-btn">Apply as Expert</div>
                </div>
              </div>
              <div className="preview-tips">
                <h5>Pro Tips</h5>
                <ul>
                  <li>Be specific about your tech stack to attract the right experts.</li>
                  <li>Clear requirements help experts quote accurately.</li>
                  <li>Adding images increases response rate by 40%.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <Footer variant="dashboard" />
      </main>
      {toastError && <Toast message={toastError} onClose={() => setToastError("")} />}
    </div>
  );
}

export default PostJobPage;
