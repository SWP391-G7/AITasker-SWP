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
import { getServiceById } from '../Services/serviceService';
import { createInvitation } from '../Services/invitationService';
import './Style/ServiceDetail.css';

const parseMoney = (value) => {
  const parsed = Number(String(value || '0').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`;

const ServiceRequestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        setError(err.message || 'Failed to load service summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const coverLetter = String(formData.get('coverLetter') || '').trim();
    const bidAmount = formData.get('bidAmount');
    const deliveryDays = formData.get('deliveryDays');

    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitMessage('');

      await createInvitation({
        serviceId: id,
        coverLetter,
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
      });

      setSubmitMessage('Purchase request sent successfully. The expert will review it shortly.');
      form.reset();
      setTimeout(() => {
        navigate('/client/projects');
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const proposalDefaults = useMemo(
    () => ({
      bidAmount: service ? parseMoney(service.price) : '',
      deliveryDays: service?.delivery_days || service?.deliveryDays || '',
    }),
    [service]
  );

  return (
    <div className="proposal-page-wrapper">
      <div className="proposal-modal-overlay">
        <section className="proposal-modal-shell" role="dialog" aria-modal="true" aria-labelledby="request-title">
          <div className="proposal-modal-header">
            <div className="proposal-hero">
              <span className="detail-tag">Service Request</span>
              <h1 className="detail-title" id="request-title">Send a Request</h1>
              <p>
                Send a purchase request for this service. You can state your custom requirements and customize terms.
              </p>
            </div>

            <button className="proposal-close-btn" type="button" onClick={() => navigate(-1)} aria-label="Close request popup">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="mt-3 text-muted">Loading service summary...</p>
            </div>
          ) : error ? (
            <div className="error-card">
              <AlertCircle size={48} className="text-danger mb-3" />
              <h3>Failed to Load Service</h3>
              <p className="text-muted">{error}</p>
            </div>
          ) : (
            <div className="proposal-layout">
              <main className="proposal-form-card glass-card">
                <div className="proposal-section-heading">
                  <FileText size={22} />
                  <div>
                    <h2>Request Details</h2>
                    <p>Explain why you want to buy this service and set your initial terms.</p>
                  </div>
                </div>

                <form className="proposal-form" onSubmit={handleSubmitRequest}>
                  <label className="proposal-field">
                    <span>Describe Your Requirements</span>
                    <textarea
                      name="coverLetter"
                      rows="8"
                      required
                      placeholder="Explain your project context, customization requirements, and why you are choosing this service."
                    />
                  </label>

                  <div className="proposal-field-grid">
                    <label className="proposal-field">
                      <span>Initial Bid Amount</span>
                      <div className="proposal-input-with-icon">
                        <DollarSign size={18} />
                        <input name="bidAmount" type="number" min="1" step="1" defaultValue={proposalDefaults.bidAmount} placeholder="500" required />
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
                      <span>Expected Delivery (Days)</span>
                      <div className="proposal-input-with-icon">
                        <Clock size={18} />
                        <input name="deliveryDays" type="number" min="1" defaultValue={proposalDefaults.deliveryDays} placeholder="7" required />
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

                  {submitError && <div className="proposal-status-message error">{submitError}</div>}
                  {submitMessage && <div className="proposal-status-message success">{submitMessage}</div>}

                  <div className="proposal-actions-row">
                    <button className="contact-btn" type="reset" disabled={submitting}>
                      Clear Form
                    </button>
                    <button className="order-btn" type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {submitting ? 'Submitting...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </main>

              <aside className="proposal-summary-column">
                <section className="pricing-card glass-card proposal-task-card">
                  <span className="pricing-label">Selected Service</span>
                  <h2>{service?.title || 'Untitled Service'}</h2>
                  <p>{service?.description || 'No description provided.'}</p>

                  <div className="proposal-task-meta">
                    <div className="metric">
                      <BriefcaseBusiness size={16} />
                      <span>{String(service?.tags || 'AI').toUpperCase()}</span>
                    </div>
                    <div className="metric">
                      <DollarSign size={16} />
                      <span>{formatMoney(service?.price)} ({service?.pricing_type})</span>
                    </div>
                    <div className="metric">
                      <Clock size={16} />
                      <span>{service?.delivery_days ? `${service.delivery_days} days delivery` : 'Flexible'}</span>
                    </div>
                  </div>
                </section>

                <section className="glass-card proposal-checklist-card">
                  <h3>Purchase Guidelines</h3>
                  <div>
                    <span><CheckCircle2 size={16} /> Service owner receives notification</span>
                    <span><CheckCircle2 size={16} /> Negotiate bid and timeline if needed</span>
                    <span><CheckCircle2 size={16} /> Start contract once approved</span>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ServiceRequestPage;
