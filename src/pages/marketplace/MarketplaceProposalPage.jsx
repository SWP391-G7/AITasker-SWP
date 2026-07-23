/**
 * Frontend module: pages/marketplace/MarketplaceProposalPage.jsx
 *
 * Vai trò: Page Marketplace Proposal Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Send,
  X,
} from 'lucide-react';
import { getMarketplaceJobById } from '../../Services/serviceService';
import { createProposal } from '../../Services/proposalService';
import { getStoredUser } from '../../Services/checkLogin';
import AIExtendButton from '../../Components/AI/AIExtendButton';
import AISkeletonLoader from '../../Components/AI/AISkeletonLoader';
import Toast from '../../Components/Toast';
import '../Style/ServiceDetail.css';

// Chuyển đổi dữ liệu cho “parse money” thành định dạng mà lớp gọi hoặc giao diện cần.
const parseMoney = (value) => {
  const parsed = Number(String(value || '0').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

// Chuyển đổi dữ liệu cho “format money” thành định dạng mà lớp gọi hoặc giao diện cần.
const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`;

// Chuyển đổi dữ liệu cho “format budget” thành định dạng mà lớp gọi hoặc giao diện cần.
const formatBudget = (task) => {
  const min = parseMoney(task?.budget_min ?? task?.budgetMin);
  const max = parseMoney(task?.budget_max ?? task?.budgetMax ?? task?.budget);

  if (min && max && min !== max) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (max) return formatMoney(max);
  if (min) return formatMoney(min);
  return 'Budget TBD';
};

// Chuyển đổi dữ liệu cho “format date” thành định dạng mà lớp gọi hoặc giao diện cần.
const formatDate = (value) => {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleDateString();
};

// React component “Marketplace Proposal Page” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const MarketplaceProposalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [coverLetter, setCoverLetter] = useState('');
  const [implementationApproach, setImplementationApproach] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [toastError, setToastError] = useState('');
  const currentUser = getStoredUser();

  if (currentUser?.role !== 'expert') {
    return (
      <div className="proposal-page-wrapper">
        <div className="proposal-modal-overlay">
          <section className="proposal-modal-shell" role="dialog" aria-modal="true" aria-labelledby="proposal-title">
            <div className="proposal-modal-header">
              <div className="proposal-hero">
                <span className="detail-tag">Access Denied</span>
                <h1 className="detail-title" id="proposal-title">Unauthorized</h1>
                <p>Only registered AI Experts can submit proposals to client tasks.</p>
              </div>
              <button className="proposal-close-btn" type="button" onClick={() => navigate(-1)} aria-label="Close popup">
                <X size={20} />
              </button>
            </div>
            <div className="error-card" style={{ padding: "40px", textAlign: "center" }}>
              <AlertCircle size={48} className="text-danger mb-3" style={{ margin: "0 auto 15px auto", display: "block" }} />
              <h3>Expert Account Required</h3>
              <p className="text-muted">You are logged in as a {currentUser?.role || 'guest'}. Only experts can access this page.</p>
              <button className="back-btn mt-3 px-4 py-2" type="button" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Handler “handle extend success” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleExtendSuccess = (data) => {
    if (data.coverLetter) setCoverLetter(data.coverLetter);
    if (data.implementationApproach) setImplementationApproach(data.implementationApproach);
    setIsGenerating(false);
    setIsAiOptimized(true);
  };

  useEffect(() => {
    // Đọc hoặc suy ra dữ liệu cho nghiệp vụ “fetch task”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
    const fetchTask = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getMarketplaceJobById(id);
        setTask(data);
      } catch (err) {
        setError(err.message || 'Failed to load task summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  // Handler “handle submit proposal” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleSubmitProposal = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const coverLetter = String(formData.get('coverLetter') || '').trim();
    const implementationApproach = String(formData.get('implementationApproach') || '').trim();
    const portfolioUrl = String(formData.get('portfolioUrl') || '').trim();
    const bidAmount = formData.get('bidAmount');
    const deliveryDays = formData.get('deliveryDays');

    const combinedCoverLetter = [
      coverLetter,
      implementationApproach ? `Implementation Approach:\n${implementationApproach}` : '',
      portfolioUrl ? `Portfolio / Reference:\n${portfolioUrl}` : '',
    ].filter(Boolean).join('\n\n');

    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitMessage('');

      await createProposal({
        jobId: id,
        coverLetter: combinedCoverLetter,
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
      });

      setSubmitMessage('Proposal submitted successfully. The client can now review it from their task detail.');
      form.reset();
      setCoverLetter('');
      setImplementationApproach('');
      setIsAiOptimized(false);
      form.querySelectorAll('input, textarea').forEach((el) => {
        if (el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'reset') el.value = '';
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const requiredSkill = task?.required_skill || task?.requiredSkill || 'AI Task';

  const proposalDefaults = useMemo(
    () => ({
      bidAmount: parseMoney(task?.budget_max ?? task?.budgetMax ?? task?.budget) || '',
      deliveryDays: task?.duration_days || task?.durationDays || '',
    }),
    [task]
  );

  return (
    <div className="proposal-page-wrapper">
      <div className="proposal-modal-overlay">
        <section className="proposal-modal-shell" role="dialog" aria-modal="true" aria-labelledby="proposal-title">
          <div className="proposal-modal-header">
            <div className="proposal-hero">
              <span className="detail-tag">Expert Proposal</span>
              <h1 className="detail-title" id="proposal-title">Create a Proposal</h1>
              <p>
                Prepare your offer for the client task. Your proposal will be sent to the client for review.
              </p>
            </div>

            <button className="proposal-close-btn" type="button" onClick={() => navigate(-1)} aria-label="Close proposal popup">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="mt-3 text-muted">Loading task summary...</p>
            </div>
          ) : error ? (
            <div className="error-card">
              <AlertCircle size={48} className="text-danger mb-3" />
              <h3>Failed to Load Task</h3>
              <p className="text-muted">{error}</p>
            </div>
          ) : (
            <div className="proposal-layout">
              <main className="proposal-form-card glass-card" style={{ position: "relative" }}>
                {isGenerating && <AISkeletonLoader message="AI Engine is composing your proposal details..." />}
                <div className="proposal-section-heading">
                  <FileText size={22} />
                  <div>
                    <h2>Proposal Details</h2>
                    <p>Explain how you will solve the task and set your delivery terms.</p>
                  </div>
                </div>

                <form className="proposal-form" onSubmit={handleSubmitProposal}>
                  <label className="proposal-field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Cover Letter</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isAiOptimized && (
                          <span className="ai-sparkle-badge">
                            ✨ AI Optimized
                          </span>
                        )}
                        <AIExtendButton
                          draftFields={[coverLetter, implementationApproach]}
                          onExtendStart={() => {
                            setIsGenerating(true);
                            setIsAiOptimized(false);
                          }}
                          onExtendSuccess={handleExtendSuccess}
                          onExtendFailure={() => setIsGenerating(false)}
                          type="proposal"
                          context={task ? `Task Title: ${task.title}\nTask Description: ${task.description}` : ''}
                          onErrorToast={(msg) => setToastError(msg)}
                        />
                      </div>
                    </div>
                    <textarea
                      name="coverLetter"
                      rows="8"
                      required
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Introduce yourself, explain your approach, and tell the client why you are a good fit for this task."
                    />
                  </label>

                  <div className="proposal-field-grid">
                    <label className="proposal-field">
                      <span>Bid Amount</span>
                      <div className="proposal-input-with-icon">
                        <DollarSign size={18} />
                        <input name="bidAmount" type="number" min="1" step="1" defaultValue={proposalDefaults.bidAmount} placeholder="1200" required />
                        <div className="proposal-input-stepper">
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepUp(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronUp size={14} />
                          </button>
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepDown(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </label>

                    <label className="proposal-field">
                      <span>Delivery Days</span>
                      <div className="proposal-input-with-icon">
                        <Clock size={18} />
                        <input name="deliveryDays" type="number" min="1" defaultValue={proposalDefaults.deliveryDays} placeholder="14" required />
                        <div className="proposal-input-stepper">
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepUp(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronUp size={14} />
                          </button>
                          <button type="button" tabIndex={-1} onClick={(e) => { const i = e.currentTarget.parentElement.previousElementSibling; i.stepDown(); i.dispatchEvent(new Event('input', { bubbles: true })); }}>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>

                  <label className="proposal-field">
                    <span>Implementation Approach</span>
                    <textarea
                      name="implementationApproach"
                      rows="5"
                      value={implementationApproach}
                      onChange={(e) => setImplementationApproach(e.target.value)}
                      placeholder="Describe milestones, tools, model strategy, testing plan, and expected deliverables."
                    />
                  </label>

                  <label className="proposal-field">
                    <span>Portfolio or Reference Link</span>
                    <input name="portfolioUrl" type="url" placeholder="https://your-portfolio.com/project" />
                  </label>

                  {submitError && <div className="proposal-status-message error">{submitError}</div>}
                  {submitMessage && <div className="proposal-status-message success">{submitMessage}</div>}

                  <div className="proposal-actions-row">
                    <button className="contact-btn" type="reset" disabled={submitting}>
                      Clear Form
                    </button>
                    <button className="order-btn" type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                  </div>
                </form>
              </main>

              <aside className="proposal-summary-column">
                <section className="pricing-card glass-card proposal-task-card">
                  <span className="pricing-label">Task Summary</span>
                  <h2>{task?.title || 'Untitled Client Task'}</h2>
                  <p>{task?.description || 'No description provided for this task.'}</p>

                  <div className="proposal-task-meta">
                    <div className="metric">
                      <BriefcaseBusiness size={16} />
                      <span>{String(requiredSkill).toUpperCase()}</span>
                    </div>
                    <div className="metric">
                      <DollarSign size={16} />
                      <span>{formatBudget(task)}</span>
                    </div>
                    <div className="metric">
                      <CalendarDays size={16} />
                      <span>{formatDate(task?.deadline)}</span>
                    </div>
                    <div className="metric">
                      <Clock size={16} />
                      <span>{task?.duration_days ? `${task.duration_days} days` : 'Duration TBD'}</span>
                    </div>
                  </div>
                </section>

                <section className="glass-card proposal-checklist-card">
                  <h3>Before Submitting</h3>
                  <div>
                    <span><CheckCircle2 size={16} /> Clear scope and deliverables</span>
                    <span><CheckCircle2 size={16} /> Realistic timeline</span>
                    <span><CheckCircle2 size={16} /> Budget matches task complexity</span>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </section>
      </div>
      {toastError && <Toast message={toastError} onClose={() => setToastError('')} />}
    </div>
  );
};

export default MarketplaceProposalPage;
