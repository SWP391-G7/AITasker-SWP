import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Info,
  Loader2,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import ClientSidebar from '../Components/Dashboard/Client/ClientSidebar';
import ExpertSidebar from '../Components/Dashboard/Expert/ExpertSidebar';
import Footer from '../Components/Footer/Footer';
import {
  getProjectById,
  closeProject,
  payMilestone,
  submitMilestonePlan,
  updateMilestone,
  approveMilestone,
  declineMilestone,
  submitMilestoneResponse,
  submitMilestoneContent,
  startProject,
} from '../Services/projectService';
import './DashboardPage/Client/ClientMarketplace.css';

// ── Status metadata ──────────────────────────────────────────────────────────
const STATUS_LABELS = {
  Planning:          'Planning',
  'On-going':        'On-going',
  Completed:         'Completed',
  Pending:           'Pending',
  Approved:          'Approved',
  Declined:          'Declined',
  'Wait for payment': 'Wait for payment',
  Finished:          'Finished',
  // legacy
  active:            'Active',
  terminated:        'Terminated',
};

const STATUS_COLORS = {
  Planning:          { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd' },
  'On-going':        { bg: 'rgba(59,130,246,0.2)',   color: '#60a5fa' },
  Completed:         { bg: 'rgba(16,185,129,0.2)',   color: '#10b981' },
  Pending:           { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' },
  Approved:          { bg: 'rgba(16,185,129,0.16)',  color: '#34d399' },
  Declined:          { bg: 'rgba(239,68,68,0.14)',   color: '#f87171' },
  'Wait for payment': { bg: 'rgba(251,191,36,0.14)',  color: '#fde68a' },
  Finished:          { bg: 'rgba(16,185,129,0.16)',  color: '#34d399' },
  active:            { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  terminated:        { bg: 'rgba(239,68,68,0.14)',   color: '#f87171' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: 'rgba(255,255,255,0.05)', color: '#fff' };
  return (
    <span style={{
      display: 'inline-block',
      background: s.bg, color: s.color,
      padding: '3px 11px', borderRadius: '20px',
      fontSize: '0.73rem', fontWeight: '700',
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── Shared style objects ──────────────────────────────────────────────────────
const CARD = {
  background: '#0b1220',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '28px',
};

const inputSt = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px', color: '#fff', fontSize: '0.93rem',
  boxSizing: 'border-box',
};

const btnGreen  = { backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.9rem' };
const btnOutline= { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' };
const btnAmber  = { ...btnGreen, backgroundColor: '#d97706' };
const btnRed    = { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', color: '#f87171', borderRadius: '8px', padding: '10px 18px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' };
const btnIndigo = { ...btnGreen, backgroundColor: '#4f46e5' };

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtMoney = (v) => `$${parseFloat(v || 0).toLocaleString()}`;
const labelSt  = { fontSize: '0.77rem', color: 'rgba(255,255,255,0.42)', fontWeight: '700', display: 'block', marginBottom: '5px', letterSpacing: '0.04em' };

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate      = useNavigate();

  const [project,    setProject]    = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [actionErr,  setActionErr]  = useState('');
  const [busy,       setBusy]       = useState(false);

  // Expert's local draft list for initial planning
  const [drafts, setDrafts] = useState([
    { localId: 1, title: '', amount: '', delivery_days: '' },
  ]);

  // Client response inputs for declined milestones: { [milestoneId]: string }
  const [clientResponseTexts, setClientResponseTexts] = useState({});

  // Expert fix milestone forms: { [milestoneId]: { title, amount, delivery_days } }
  const [fixingMilestones, setFixingMilestones] = useState({});

  // Expert submit content forms: { [milestoneId]: string }
  const [submittingContent, setSubmittingContent] = useState({});

  // User identity from localStorage
  const user  = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }, []);
  const role  = user?.role ?? null;
  const isExp = role === 'expert';
  const isCli = role === 'client';

  const sorted = useMemo(
    () => [...milestones].sort((a, b) => (a.position || 0) - (b.position || 0)),
    [milestones]
  );

  const phase = useMemo(() => {
    if (!project) return 'empty';
    if (project.status === 'Planning') {
      return sorted.length === 0 ? 'empty' : 'planning';
    }
    return 'active';
  }, [project, sorted]);

  const allApproved = useMemo(() => {
    return sorted.length > 0 && sorted.every(m => m.status === 'Approved');
  }, [sorted]);

  const progressPct = useMemo(() => {
    if (sorted.length === 0) return 0;
    const done = sorted.filter(m => m.status === 'Finished').length;
    return Math.round((done / sorted.length) * 100);
  }, [sorted]);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getProjectById(projectId);
      setProject(data.project);
      const ms = (data.milestones || []).sort((a, b) => (a.position || 0) - (b.position || 0));
      setMilestones(ms);

      // Seed drafts from existing planning if empty
      if (ms.length === 0) {
        setDrafts([{ localId: 1, title: '', amount: '', delivery_days: '' }]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProjectData(); }, [fetchProjectData]);

  const addDraft    = () => setDrafts(p => [...p, { localId: Date.now(), title: '', amount: '', delivery_days: '' }]);
  const removeDraft = (lid) => setDrafts(p => p.filter(d => d.localId !== lid));
  const editDraft   = (lid, field, val) => setDrafts(p => p.map(d => d.localId === lid ? { ...d, [field]: val } : d));

  const wrap = async (fn) => {
    setActionErr('');
    setBusy(true);
    try { await fn(); await fetchProjectData(); }
    catch (e) { setActionErr(e.message || 'An error occurred.'); }
    finally   { setBusy(false); }
  };

  // Expert submits initial milestones
  const handleSubmitPlan = () => {
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      if (!d.title.trim()) { setActionErr(`Milestone ${i + 1}: title is required.`); return; }
      if (!d.amount || parseFloat(d.amount) <= 0) { setActionErr(`Milestone ${i + 1}: enter a valid amount.`); return; }
      if (!d.delivery_days || parseInt(d.delivery_days, 10) <= 0) { setActionErr(`Milestone ${i + 1}: enter valid delivery days.`); return; }
    }
    wrap(() => submitMilestonePlan(projectId, drafts.map(d => ({
      title: d.title.trim(),
      amount: parseFloat(d.amount),
      delivery_days: parseInt(d.delivery_days, 10),
    }))));
  };

  // Client approves milestone
  const handleApproveMilestone = (id) => {
    wrap(() => approveMilestone(id));
  };

  // Client declines milestone
  const handleDeclineMilestone = (id) => {
    wrap(() => declineMilestone(id));
  };

  // Client submits response for declined milestone
  const handleSubmitResponse = (id) => {
    const text = clientResponseTexts[id];
    if (!text || !text.trim()) { setActionErr('Please enter a response message.'); return; }
    wrap(async () => {
      await submitMilestoneResponse(id, text.trim());
      setClientResponseTexts(p => ({ ...p, [id]: '' }));
    });
  };

  // Expert clicks Fix -> opens inline fix form
  const handleStartFix = (m) => {
    setFixingMilestones(p => ({
      ...p,
      [m.id]: { title: m.title, amount: String(m.amount), delivery_days: String(m.delivery_days) }
    }));
  };

  const handleCancelFix = (id) => {
    setFixingMilestones(p => {
      const copy = { ...p };
      delete copy[id];
      return copy;
    });
  };

  const handleSaveFix = (id) => {
    const data = fixingMilestones[id];
    if (!data.title.trim()) { setActionErr('Title is required.'); return; }
    if (!data.amount || parseFloat(data.amount) <= 0) { setActionErr('Enter a valid amount.'); return; }
    if (!data.delivery_days || parseInt(data.delivery_days, 10) <= 0) { setActionErr('Enter valid delivery days.'); return; }

    wrap(async () => {
      await updateMilestone(id, {
        title: data.title.trim(),
        amount: parseFloat(data.amount),
        delivery_days: parseInt(data.delivery_days, 10)
      });
      setFixingMilestones(p => {
        const copy = { ...p };
        delete copy[id];
        return copy;
      });
    });
  };

  // Expert submits/resubmits content after project starts
  const handleSubmitContent = (id) => {
    const contentText = submittingContent[id];
    if (!contentText || !contentText.trim()) { setActionErr('Please enter content description.'); return; }
    wrap(async () => {
      await submitMilestoneContent(id, contentText.trim());
      setSubmittingContent(p => ({ ...p, [id]: '' }));
    });
  };

  // Client starts project
  const handleStartProject = () => {
    wrap(() => startProject(projectId));
  };

  // Client pays milestone
  const handlePay = (id) => {
    wrap(async () => {
      const res = await payMilestone(id);
      if (res.projectCompleted) setTimeout(() => alert('🎉 All milestones complete — the project is Finished!'), 300);
    });
  };

  const handleCloseProject = () => {
    if (!window.confirm('Close this project? This cannot be undone.')) return;
    wrap(() => closeProject(projectId));
  };

  if (loading && !project) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#070c14', color: '#fff' }}>
        <Loader2 size={32} className="animate-spin" style={{ marginRight: '12px', color: '#10b981' }} />
        <h3 style={{ margin: 0 }}>Loading project...</h3>
      </div>
    );
  }

  const isAbandoned = project?.status === 'terminated';

  return (
    <div className="market-client-layout">
      {isCli ? (
        <ClientSidebar activeTab="projects" />
      ) : (
        <ExpertSidebar
          activeTab="projects"
          onTabChange={(id) => navigate(id === 'dashboard' ? '/expert/dashboard' : `/expert/${id}`)}
          onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}
        />
      )}

      <main className="post-job-main">
        {/* Header */}
        <header className="post-job-header" style={{ marginBottom: '24px' }}>
          <button type="button" className="back-circle" onClick={() => navigate(isCli ? '/client/projects' : '/expert/projects')}>
            <ArrowLeft size={26} />
          </button>
          <div>
            <h1>Project Detail</h1>
            <p>Track milestones, deliverables, and payments.</p>
          </div>
        </header>

        {error     && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}
        {actionErr && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{actionErr}</div>}

        {isAbandoned ? (
          <section style={{ ...CARD, textAlign: 'center', padding: '60px 40px' }}>
            <AlertTriangle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Project Closed</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '28px' }}>This project has been terminated or closed.</p>
            <button style={btnOutline} onClick={() => navigate(isCli ? '/client/projects' : '/expert/projects')}>
              Return to Projects
            </button>
          </section>
        ) : project && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── PROJECT INFO CARD ──────────────────────────────────── */}
            <section style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{project.title || 'Project Contract'}</h2>
                    <StatusBadge status={project.status} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.93rem' }}>{project.description || 'No description provided.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <button style={btnOutline} onClick={fetchProjectData} disabled={busy}>
                    <RefreshCcw size={14} style={{ marginRight: '4px', display: 'inline' }} /> Refresh
                  </button>
                  {isCli && project.status === 'active' && (
                    <button style={btnRed} onClick={handleCloseProject} disabled={busy}>Abandon Project</button>
                  )}
                  {isCli && project.status === 'Planning' && allApproved && (
                    <button style={btnGreen} onClick={handleStartProject} disabled={busy}>
                      Start Project
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px', marginBottom: '20px' }}>
                <div>
                  <span style={labelSt}>CLIENT</span>
                  <strong style={{ color: '#fff', display: 'block' }}>{project.client_name || 'Client'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)' }}>{project.client_email}</span>
                </div>
                <div>
                  <span style={labelSt}>EXPERT</span>
                  <strong style={{ color: '#fff', display: 'block' }}>{project.expert_name || 'Expert'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)' }}>{project.expert_email}</span>
                </div>
                <div>
                  <span style={labelSt}>TOTAL BUDGET</span>
                  <strong style={{ color: '#fff', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <DollarSign size={18} style={{ color: '#10b981' }} />
                    {parseFloat(project.total_amount || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span style={labelSt}>STARTED</span>
                  <span style={{ color: '#fff', fontSize: '0.93rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarDays size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
                    {fmtDate(project.start_date)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>Milestone Progress</span>
                  <strong style={{ color: '#fff', fontSize: '0.88rem' }}>
                    {progressPct}% &nbsp;·&nbsp; {sorted.filter(m => m.status === 'Finished').length}/{sorted.length} Finished
                  </strong>
                </div>
                <div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', transition: 'width 0.5s ease', borderRadius: '4px' }} />
                </div>
              </div>
            </section>

            {/* ── MILESTONES SECTION ────────────────────────────────── */}
            <section style={CARD}>
              {/* phase: empty (no milestones) */}
              {phase === 'empty' && (
                isExp ? (
                  <DraftBuilder
                    drafts={drafts}
                    addDraft={addDraft}
                    removeDraft={removeDraft}
                    editDraft={editDraft}
                    onSubmit={handleSubmitPlan}
                    busy={busy}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.35)' }}>
                    <Info size={44} style={{ opacity: 0.18, marginBottom: '16px' }} />
                    <h4 style={{ color: '#fff', marginBottom: '8px' }}>Waiting for the Expert</h4>
                    <p style={{ fontSize: '0.9rem' }}>The expert has not submitted a milestone plan yet.</p>
                  </div>
                )
              )}

              {/* phase: planning */}
              {phase === 'planning' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 6px 0' }}>Milestone Planning Review</h3>
                      <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.88rem' }}>
                        {isCli ? 'Review the proposed milestones. Approve or decline each milestone.' : 'Milestone plan has been submitted. Awaiting client review.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sorted.map((m, idx) => {
                      const isFixing = !!fixingMilestones[m.id];
                      const fixData = fixingMilestones[m.id];

                      return (
                        <div key={m.id} style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
                          {isFixing ? (
                            <div>
                              <div style={{ fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Fix Milestone #{idx + 1}</div>
                              <div style={{ marginBottom: '12px' }}>
                                <label style={labelSt}>TITLE *</label>
                                <input
                                  style={inputSt}
                                  type="text"
                                  value={fixData.title}
                                  onChange={e => setFixingMilestones(p => ({ ...p, [m.id]: { ...p[m.id], title: e.target.value } }))}
                                />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                                <div>
                                  <label style={labelSt}>AMOUNT ($) *</label>
                                  <input
                                    style={inputSt}
                                    type="number"
                                    value={fixData.amount}
                                    onChange={e => setFixingMilestones(p => ({ ...p, [m.id]: { ...p[m.id], amount: e.target.value } }))}
                                  />
                                </div>
                                <div>
                                  <label style={labelSt}>DELIVERY TIME (DAYS) *</label>
                                  <input
                                    style={inputSt}
                                    type="number"
                                    value={fixData.delivery_days}
                                    onChange={e => setFixingMilestones(p => ({ ...p, [m.id]: { ...p[m.id], delivery_days: e.target.value } }))}
                                  />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={btnOutline} onClick={() => handleCancelFix(m.id)} disabled={busy}>Cancel</button>
                                <button style={btnGreen} onClick={() => handleSaveFix(m.id)} disabled={busy}>Save Fix & Resubmit</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <strong style={{ color: '#fff', fontSize: '0.97rem' }}>#{idx + 1} {m.title}</strong>
                                    <StatusBadge status={m.status} />
                                  </div>
                                  <span style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                    Duration: {m.delivery_days} days · Amount: {fmtMoney(m.amount)}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {isCli && m.status === 'Pending' && (
                                    <>
                                      <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => handleApproveMilestone(m.id)} disabled={busy}>Approve</button>
                                      <button style={{ ...btnRed, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => handleDeclineMilestone(m.id)} disabled={busy}>Decline</button>
                                    </>
                                  )}
                                  {isExp && m.status === 'Declined' && (
                                    <button style={{ ...btnAmber, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => handleStartFix(m)} disabled={busy}>Fix</button>
                                  )}
                                </div>
                              </div>

                              {/* Client response view / input */}
                              {m.response && (
                                <div style={{ marginTop: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#fbbf24', fontSize: '0.85rem' }}>
                                  <strong>Response:</strong> {m.response}
                                </div>
                              )}

                              {isCli && m.status === 'Declined' && !m.response && (
                                <div style={{ marginTop: '12px' }}>
                                  <label style={labelSt}>ENTER RESPONSE</label>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                      style={inputSt}
                                      type="text"
                                      placeholder="Explain why this milestone was declined..."
                                      value={clientResponseTexts[m.id] || ''}
                                      onChange={e => setClientResponseTexts(p => ({ ...p, [m.id]: e.target.value }))}
                                    />
                                    <button style={btnGreen} onClick={() => handleSubmitResponse(m.id)} disabled={busy}>Response</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* phase: active (ongoing project) */}
              {phase === 'active' && (
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Milestone Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sorted.map((m, idx) => {
                      const isSubmitting = submittingContent[m.id] !== undefined;

                      return (
                        <div key={m.id} style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <strong style={{ color: '#fff', fontSize: '0.97rem' }}>#{idx + 1} {m.title}</strong>
                                <StatusBadge status={m.status} />
                              </div>
                              <span style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                Duration: {m.delivery_days} days · Amount: {fmtMoney(m.amount)}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              {isExp && m.status === 'Approved' && !isSubmitting && (
                                <button
                                  style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }}
                                  onClick={() => setSubmittingContent(p => ({ ...p, [m.id]: '' }))}
                                  disabled={busy}
                                >
                                  Submit Work
                                </button>
                              )}
                              {isExp && m.status === 'Declined' && !isSubmitting && (
                                <button
                                  style={{ ...btnAmber, padding: '6px 14px', fontSize: '0.83rem' }}
                                  onClick={() => setSubmittingContent(p => ({ ...p, [m.id]: m.content || '' }))}
                                  disabled={busy}
                                >
                                  Fix Work
                                </button>
                              )}
                              {isCli && m.status === 'Pending' && (
                                <>
                                  <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => handleApproveMilestone(m.id)} disabled={busy}>Approve</button>
                                  <button style={{ ...btnRed, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => handleDeclineMilestone(m.id)} disabled={busy}>Decline</button>
                                </>
                              )}
                              {isCli && m.status === 'Wait for payment' && (
                                <button style={{ ...btnIndigo, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => handlePay(m.id)} disabled={busy}>
                                  <CreditCard size={13} style={{ marginRight: '4px', display: 'inline' }} /> Pay
                                </button>
                              )}
                              {m.status === 'Finished' && (
                                <span style={{ color: '#34d399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                  <CheckCircle2 size={14} /> Paid
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content description display */}
                          {m.content && (
                            <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px 16px' }}>
                              <span style={labelSt}>SUBMITTED WORK CONTENT</span>
                              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{m.content}</p>
                            </div>
                          )}

                          {/* Expert submit content text area */}
                          {isSubmitting && (
                            <div style={{ marginTop: '16px' }}>
                              <label style={labelSt}>DESCRIBE DELIVERED WORK *</label>
                              <textarea
                                style={{ ...inputSt, resize: 'vertical', minHeight: '80px', marginBottom: '12px' }}
                                placeholder="Describe the work, repository details, or notes regarding this milestone..."
                                value={submittingContent[m.id]}
                                onChange={e => setSubmittingContent(p => ({ ...p, [m.id]: e.target.value }))}
                              />
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  style={btnOutline}
                                  onClick={() => setSubmittingContent(p => {
                                    const copy = { ...p };
                                    delete copy[m.id];
                                    return copy;
                                  })}
                                  disabled={busy}
                                >
                                  Cancel
                                </button>
                                <button style={btnGreen} onClick={() => handleSubmitContent(m.id)} disabled={busy}>Submit Deliverable</button>
                              </div>
                            </div>
                          )}

                          {/* Client response view / input */}
                          {m.response && (
                            <div style={{ marginTop: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#fbbf24', fontSize: '0.85rem' }}>
                              <strong>Response:</strong> {m.response}
                            </div>
                          )}

                          {isCli && m.status === 'Declined' && !m.response && (
                            <div style={{ marginTop: '12px' }}>
                              <label style={labelSt}>ENTER RESPONSE</label>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                  style={inputSt}
                                  type="text"
                                  placeholder="Explain why this content was declined..."
                                  value={clientResponseTexts[m.id] || ''}
                                  onChange={e => setClientResponseTexts(p => ({ ...p, [m.id]: e.target.value }))}
                                />
                                <button style={btnGreen} onClick={() => handleSubmitResponse(m.id)} disabled={busy}>Response</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Expert's local draft builder — used when there are no milestones yet */
function DraftBuilder({ drafts, addDraft, removeDraft, editDraft, onSubmit, busy }) {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 6px 0' }}>📋 Plan Your Milestones</h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.88rem' }}>
          Define each stage of your project. Add all milestones, then submit for client approval.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        {drafts.map((d, idx) => (
          <div
            key={d.localId}
            style={{
              background: 'rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>Milestone #{idx + 1}</span>
              {drafts.length > 1 && (
                <button
                  onClick={() => removeDraft(d.localId)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelSt}>TITLE *</label>
              <input style={inputSt} type="text" placeholder="e.g. Frontend UI Implementation" value={d.title} onChange={e => editDraft(d.localId, 'title', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelSt}>AMOUNT ($) *</label>
                <input style={inputSt} type="number" min="1" placeholder="e.g. 500" value={d.amount} onChange={e => editDraft(d.localId, 'amount', e.target.value)} />
              </div>
              <div>
                <label style={labelSt}>DELIVERY TIME (DAYS) *</label>
                <input style={inputSt} type="number" min="1" step="1" placeholder="e.g. 14" value={d.delivery_days} onChange={e => editDraft(d.localId, 'delivery_days', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
        <button style={btnOutline} onClick={addDraft} disabled={busy}>
          <Plus size={15} style={{ marginRight: '4px', display: 'inline' }} /> Add Milestone
        </button>
        <button style={{ ...btnGreen, marginLeft: 'auto' }} onClick={onSubmit} disabled={busy}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Submit Plan
        </button>
      </div>
    </div>
  );
}
