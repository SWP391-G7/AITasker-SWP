import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Camera, Video, AlertCircle, CheckCircle2, Clock, RefreshCcw } from "lucide-react";
import ExpertSidebar from "../../../Components/Dashboard/Expert/ExpertSidebar";
import ExpertHeader from "../../../Components/Dashboard/Expert/ExpertHeader";
import Footer from "../../../Components/Footer/Footer";
import AIExtendButton from "../../../Components/AI/AIExtendButton";
import AISkeletonLoader from "../../../Components/AI/AISkeletonLoader";
import Toast from "../../../Components/Toast";
import { logout } from "../../../Services/authService";
import { publishService } from "../../../Services/serviceService";
import { uploadImage } from "../../../Services/uploadService";
import "../Style/AdminDashboardPage.css";
import "../Client/ClientMarketplace.css";
import "../../../Components/Dashboard/Expert/PostService/PostService.css";

function PostServicePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
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
    videoLink: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [toastError, setToastError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const avatarLetter = useMemo(() => {
    const currentUserName = user?.fullName || user?.name || "Expert";
    return currentUserName.trim().charAt(0).toUpperCase() || "E";
  }, [user]);

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleExtendSuccess = (data) => {
    let parsedTags = "";
    if (data.tags) {
      parsedTags = Array.isArray(data.tags)
        ? data.tags.join(", ")
        : typeof data.tags === "string"
        ? data.tags
        : "";
    }

    let titleVal = data.title || "";
    if (titleVal) {
      titleVal = titleVal.replace(/^i\s+will\s+/i, "");
      const firstWord = titleVal.split(" ")[0];
      if (firstWord && firstWord !== firstWord.toUpperCase()) {
        titleVal = titleVal.charAt(0).toLowerCase() + titleVal.slice(1);
      }
    }

    setFormData((prev) => ({
      ...prev,
      title: titleVal || prev.title,
      description: data.description || prev.description,
      techStack: parsedTags || prev.techStack,
      tags: parsedTags || prev.tags,
    }));
    setIsGenerating(false);
    setIsAiOptimized(true);
  };

  const handleTabChange = (id) => {
    if (id === "dashboard") navigate("/expert/dashboard");
    else navigate(`/expert/${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const updateFAQ = (index, field, value) => {
    setFormData((prev) => {
      const updatedFAQs = [...prev.faqs];
      updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
      return { ...prev, faqs: updatedFAQs };
    });
  };

  const removeFAQ = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const updateFeature = (index, value) => {
    setFormData((prev) => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return { ...prev, features: updatedFeatures };
    });
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (!formData.title.trim()) {
        setError("Please enter a service title.");
        return false;
      }

      if (!formData.techStack.trim()) {
        setError("Please enter the tech stack.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        setError("Please enter a service description.");
        return false;
      }

      if (formData.description.trim().length < 120) {
        setError("Service description must be at least 120 characters.");
        return false;
      }
    }

    if (step === 3) {
      const priceNum = Number(formData.price);
      if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
        setError("Please enter a valid positive price.");
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

      const serviceData = {
        title: formData.title.trim(),
        techStack: formData.techStack.trim(),
        tags: formData.tags.trim(),
        description: formData.description.trim(),
        price: formData.price,
        deliveryDays: formData.delivery,
        faqs: formData.faqs.filter((f) => f.question.trim() && f.answer.trim()),
        images: JSON.stringify(imageUrls),
        videoLink: formData.videoLink.trim(),
      };

      await publishService(serviceData);

      setSuccess("Service published successfully!");

      setTimeout(() => {
        navigate("/marketplace");
      }, 800);
    } catch (err) {
      setError(err.message || "Failed to publish service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="market-client-layout">
      <ExpertSidebar activeTab="post-service" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="post-job-main">
        <ExpertHeader
          title="Post a New Service"
          subtitle="Define your offering and start helping clients with AI."
          headerActions={
            <button
              type="button"
              className="client-header-action"
              onClick={() => navigate("/expert/dashboard")}
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
                {isGenerating && <AISkeletonLoader message="AI Engine is designing your service description..." />}
                {error && (
                  <div
                    className="error-alert mb-4"
                    style={{
                      color: "#ef4444",
                      padding: "1rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      borderRadius: "0.5rem",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {error}
                  </div>
                )}
                {success && <div className="alert alert-success">{success}</div>}

                {step === 1 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isAiOptimized && <span className="ai-sparkle-badge">✨ AI Optimized</span>}
                      </div>
                      <AIExtendButton
                        draftFields={[formData.title, formData.description]}
                        onExtendStart={() => {
                          setIsGenerating(true);
                          setIsAiOptimized(false);
                        }}
                        onExtendSuccess={handleExtendSuccess}
                        onExtendFailure={() => setIsGenerating(false)}
                        type="service_description"
                        onErrorToast={(msg) => setToastError(msg)}
                      />
                    </div>

                    <div className="form-group">
                      <label>I WILL...</label>
                      <div className="input-with-prefix">
                        <span>I will</span>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          maxLength={80}
                          placeholder="e.g., build a custom RAG system for your documentation"
                        />
                      </div>
                      <p>Start with a strong action verb. Maximum 80 characters.</p>
                    </div>

                    <div className="form-group">
                      <label>TECH STACK</label>
                      <input
                        type="text"
                        name="techStack"
                        value={formData.techStack}
                        onChange={handleChange}
                        placeholder="e.g., Python, LangChain, OpenAI, Pinecone"
                      />
                      <p>List technologies or tools used in this service.</p>
                    </div>

                    <div className="form-group">
                      <label>TAGS</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g., NLP, RAG, Automation"
                      />
                      <p>Comma-separated tags to help clients find your service.</p>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="form-group">
                      <label>SERVICE DESCRIPTION</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Introduce your service, your process, and why clients should choose you..."
                        style={{ minHeight: "150px" }}
                      ></textarea>
                      <p>Min. 120 characters. Be as detailed as possible.</p>
                    </div>

                    <div className="form-group">
                      <label>FREQUENTLY ASKED QUESTIONS</label>
                      <div className="faq-list">
                        {formData.faqs.map((faq, idx) => (
                          <div key={idx} className="faq-item-card" style={{ marginBottom: "1rem" }}>
                            <div className="faq-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                              <span>FAQ #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeFAQ(idx)}
                                className="text-danger"
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Add a Question: e.g., Do you provide source code?"
                              value={faq.question}
                              onChange={(e) => updateFAQ(idx, "question", e.target.value)}
                              style={{ width: "100%", marginBottom: "0.5rem" }}
                            />
                            <textarea
                              placeholder="Add an Answer"
                              value={faq.answer}
                              onChange={(e) => updateFAQ(idx, "answer", e.target.value)}
                              style={{ width: "100%", minHeight: "60px" }}
                            ></textarea>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="add-faq-btn"
                        onClick={addFAQ}
                        style={{
                          background: "none",
                          border: "1px dashed rgba(255,255,255,0.2)",
                          borderRadius: "0.5rem",
                          padding: "0.5rem 1rem",
                          color: "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginTop: "1rem",
                        }}
                      >
                        <Plus size={16} /> Add FAQ
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="form-row two-cols">
                      <div className="form-field">
                        <label>PRICE ($)</label>
                        <input
                          type="number"
                          name="price"
                          min="1"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="e.g., 150"
                        />
                        <p>Set a fixed price for this service.</p>
                      </div>

                      <div className="form-field">
                        <label>DELIVERY TIME</label>
                        <div className="select-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Clock size={14} style={{ color: "#94a3b8" }} />
                          <select
                            name="delivery"
                            value={formData.delivery}
                            onChange={handleChange}
                            style={{
                              background: "#060b18",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "0.5rem",
                              padding: "0.75rem",
                              color: "white",
                              width: "100%",
                              outline: "none",
                            }}
                          >
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                            <option value="30">30 Days</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "1.5rem" }}>
                      <label>REVISIONS</label>
                      <div className="select-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <RefreshCcw size={14} style={{ color: "#94a3b8" }} />
                        <select
                          name="revisions"
                          value={formData.revisions}
                          onChange={handleChange}
                          style={{
                            background: "#060b18",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.5rem",
                            padding: "0.75rem",
                            color: "white",
                            width: "100%",
                            outline: "none",
                          }}
                        >
                          <option value="1">1 Revision</option>
                          <option value="3">3 Revisions</option>
                          <option value="5">5 Revisions</option>
                          <option value="Unlimited">Unlimited</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: "1.5rem" }}>
                      <label>DELIVERABLES</label>
                      {formData.features.map((feat, idx) => (
                        <div key={idx} className="feature-input-group" style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <input
                            type="text"
                            value={feat}
                            placeholder="Add deliverable..."
                            onChange={(e) => updateFeature(idx, e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="remove-btn"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-feat-btn"
                        onClick={addFeature}
                        style={{
                          background: "none",
                          border: "1px dashed rgba(255,255,255,0.2)",
                          borderRadius: "0.5rem",
                          padding: "0.5rem 1rem",
                          color: "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Plus size={14} /> Add Deliverable
                      </button>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="form-section fade-in">
                      <h3 className="section-title">Service Gallery</h3>

                      <div className="media-guidelines">
                        <div className="guideline-item">
                          <AlertCircle size={16} />
                          <span>Upload images that showcase your best AI work. (Max 3)</span>
                        </div>
                      </div>

                      <div className="upload-grid-enhanced">
                        {formData.images && formData.images[0] ? (
                          <div className="preview-box main">
                            <img src={formData.images[0].preview} alt="Primary" />
                            <button
                              type="button"
                              className="remove-media-btn"
                              onClick={() => {
                                URL.revokeObjectURL(formData.images[0].preview);
                                const updated = formData.images.filter((_, i) => i !== 0);
                                setFormData((prev) => ({ ...prev, images: updated }));
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
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
                            <button
                              type="button"
                              className="remove-media-btn"
                              onClick={() => {
                                URL.revokeObjectURL(formData.images[1].preview);
                                const updated = formData.images.filter((_, i) => i !== 1);
                                setFormData((prev) => ({ ...prev, images: updated }));
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
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
                            <button
                              type="button"
                              className="remove-media-btn"
                              onClick={() => {
                                URL.revokeObjectURL(formData.images[2].preview);
                                const updated = formData.images.filter((_, i) => i !== 2);
                                setFormData((prev) => ({ ...prev, images: updated }));
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
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
                            const newImages = files.map((file) => ({
                              file,
                              preview: URL.createObjectURL(file),
                            }));
                            setFormData((prev) => ({
                              ...prev,
                              images: [...(prev.images || []), ...newImages].slice(0, 3),
                            }));
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ marginTop: "2rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Video size={16} style={{ color: "#60a5fa" }} />
                          VIDEO DEMO (OPTIONAL)
                        </label>
                        <div className="video-input-wrapper">
                          <input
                            type="text"
                            placeholder="Paste YouTube, Vimeo or Loom URL here..."
                            className="video-url-input"
                            value={formData.videoLink || ""}
                            onChange={(e) => setFormData((prev) => ({ ...prev, videoLink: e.target.value }))}
                          />
                        </div>
                        <p className="help-text">Video samples are shown to increase conversions by up to 25%.</p>
                      </div>
                    </div>
                  </>
                )}
              </section>

              <section className="post-actions">
                {step === 1 ? (
                  <button
                    type="button"
                    className="draft-btn"
                    onClick={() => navigate("/expert/dashboard")}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                ) : (
                  <button type="button" className="draft-btn" onClick={handleBack} disabled={submitting}>
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button type="button" className="next-btn" onClick={handleNext} disabled={submitting}>
                    {step === 1 ? "Next: Details" : step === 2 ? "Next: Budget" : "Next: Media"}
                  </button>
                ) : (
                  <button type="button" className="next-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish Service"}
                  </button>
                )}
              </section>
            </form>
          </div>

          <aside className="service-preview-sidebar">
            <div className="preview-sticky">
              <h4 className="preview-label">LIVE PREVIEW</h4>
              <div className="preview-card-mock">
                <div
                  className="mock-image"
                  style={
                    formData.images?.[0]?.preview
                      ? {
                          backgroundImage: `url(${formData.images[0].preview})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  <span className="mock-tag">
                    {(formData.techStack || formData.tags || "AI").split(",")[0].trim().toUpperCase()}
                  </span>
                </div>
                <div className="mock-body">
                  <div className="mock-expert">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="mock-avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div className="mock-avatar">{avatarLetter}</div>
                    )}
                    <span>You (Expert)</span>
                    <div className="mock-rating">5.0</div>
                  </div>
                  <h3 className="mock-title">
                    {formData.title ? `I will ${formData.title}` : "Your service title will appear here..."}
                  </h3>
                  <p
                    className="mock-description"
                    style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: "1.4", marginTop: "0.5rem" }}
                  >
                    {formData.description
                      ? formData.description.substring(0, 120) + (formData.description.length > 120 ? "..." : "")
                      : "No description yet."}
                  </p>
                </div>
                <div className="mock-footer">
                  <div className="mock-price">
                    <small>STARTING AT</small>
                    <strong>{formData.price ? `$${Number(formData.price).toLocaleString()}` : "$ ---"}</strong>
                  </div>
                  <div className="mock-btn">View Details</div>
                </div>
              </div>
              <div className="preview-tips">
                <h5>Pro Tips</h5>
                <ul>
                  <li>High-quality images increase clicks by 40%.</li>
                  <li>Clear pricing helps clients decide faster.</li>
                  <li>Be specific about your deliverables.</li>
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

export default PostServicePage;

