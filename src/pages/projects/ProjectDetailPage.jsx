import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ExternalLink,
  Info,
  Loader2,
  Plus,
  RefreshCcw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import ClientSidebar from '../../Components/Dashboard/Client/ClientSidebar';
import ExpertSidebar from '../../Components/Dashboard/Expert/ExpertSidebar';
import Footer from '../../Components/Footer/Footer';
import {
  getProjectById,
  closeProject,
  payMilestone,
  submitMilestonePlan,
  approveMilestonePlan,
  requestMilestonePlanChanges,
  startMilestone,
  submitDeliverable,
  approveDeliverable,
  requestRevision,
} from '../../Services/projectService';
import '../DashboardPage/Client/ClientMarketplace.css';

// ── Status metadata ──────────────────────────────────────────────────────────
const STATUS_LABELS = {
  planning:          'Planning',
  change_requested:  'Changes Requested',
  planned:           'Planned',
  ongoing:           'Ongoing',
  submitted:         'Submitted',
  revision_requested:'Revision Needed',
  pending_payment:   'Pending Payment',
  finished:          'Finished',
  // legacy
  pending:           'Pending',
  released:          'Released',
  active:            'Active',
  completed:         'Completed',
  terminated:        'Terminated',
};

const STATUS_COLORS = {
  planning:          { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd' },
  change_requested:  { bg: 'rgba(245,158,11,0.14)',  color: '#fbbf24' },
  planned:           { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' },
  ongoing:           { bg: 'rgba(59,130,246,0.2)',   color: '#60a5fa' },
  submitted:         { bg: 'rgba(168,85,247,0.16)',  color: '#c084fc' },
  revision_requested:{ bg: 'rgba(245,158,11,0.14)',  color: '#fbbf24' },
  pending_payment:   { bg: 'rgba(251,191,36,0.14)',  color: '#fde68a' },
  finished:          { bg: 'rgba(16,185,129,0.16)',  color: '#34d399' },
  pending:           { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' },
  released:          { bg: 'rgba(16,185,129,0.16)',  color: '#34d399' },
  active:            { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  completed:         { bg: 'rgba(16,185,129,0.2)',   color: '#10b981' },
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

const MODAL_OVERLAY = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const MODAL_BOX = {
  background: '#0d1629',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px', padding: '32px',
  width: '90%', maxWidth: '560px',
  boxShadow: '0 24px 56px rgba(0,0,0,0.55)',
  color: '#fff',
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
const btnPurple = { ...btnGreen, backgroundColor: '#7c3aed' };
const btnIndigo = { ...btnGreen, backgroundColor: '#4f46e5' };

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtMoney = (v) => `$${parseFloat(v || 0).toLocaleString()}`;
const labelSt  = { fontSize: '0.77rem', color: 'rgba(255,255,255,0.42)', fontWeight: '700', display: 'block', marginBottom: '5px', letterSpacing: '0.04em' };

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate      = useNavigate();

  const [project,    setProject]    = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [actionErr,  setActionErr]  = useState('');
  const [busy,       setBusy]       = useState(false);

  // Expert's local draft list (built before submit)
  const [drafts, setDrafts] = useState([
    { localId: 1, title: '', content: '', amount: '', delivery_days: '', change_request_note: null },
  ]);

  // Modal — submit deliverable
  const [deliverableModal, setDeliverableModal] = useState({ open: false, milestoneId: null });
  const [deliverableForm,  setDeliverableForm]  = useState({ url: '', note: '' });

  // Modal — client request plan changes
  const [changesModal, setChangesModal] = useState(false);
  const [changeNotes,  setChangeNotes]  = useState({});

  // Modal — client request deliverable revision
  const [revisionModal, setRevisionModal] = useState({ open: false, milestoneId: null });
  const [revisionNote,  setRevisionNote]  = useState('');

  // User identity from localStorage
  const user  = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }, []);
  const role  = user?.role ?? null;
  const isExp = role === 'expert';
  const isCli = role === 'client';

  // ── Derived state ──────────────────────────────────────────────────────────
  const sorted = useMemo(
    () => [...milestones].sort((a, b) => (a.position || 0) - (b.position || 0)),
    [milestones]
  );

  const planMilestones = useMemo(
    () => sorted.filter(m => ['planning', 'change_requested', 'Pending', 'Declined'].includes(m.status)),
    [sorted]
  );

  // phase: 'empty' | 'planning' | 'active'
  const phase = useMemo(() => {
    if (sorted.length === 0) return 'empty';
    if (planMilestones.length > 0) return 'planning';
    return 'active';
  }, [sorted, planMilestones]);

  // First planned milestone the expert can start (all previous are finished/pending_payment)
  const startable = useMemo(() => {
    if (!isExp) return null;
    for (const m of sorted) {
      if (m.status === 'planned') {
        const prevOk = sorted
          .filter(p => p.position < m.position)
          .every(p => ['finished', 'pending_payment'].includes(p.status));
        return prevOk ? m : null;
      }
      if (!['finished', 'pending_payment'].includes(m.status)) return null;
    }
    return null;
  }, [sorted, isExp]);

  const progressPct = useMemo(() => {
    if (sorted.length === 0) return 0;
    const done = sorted.filter(m => ['pending_payment', 'finished'].includes(m.status)).length;
    return Math.round((done / sorted.length) * 100);
  }, [sorted]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getProjectById(projectId);
      setProject(data.project);
      const ms = (data.milestones || []).sort((a, b) => (a.position || 0) - (b.position || 0));
      setMilestones(ms);

      // Seed drafts from existing planning/change_requested milestones
      const seed = ms.filter(m => ['planning', 'change_requested'].includes(m.status));
      if (seed.length > 0) {
        setDrafts(seed.map(m => ({
          localId: m.id,
          title: m.title,
          content: m.content || '',
          amount: String(m.amount),
          delivery_days: String(m.delivery_days || ''),
          change_request_note: m.change_request_note,
        })));
      }

      // Pre-fill changeNotes keys for request-changes modal
      const notes = {};
      ms.filter(m => m.status === 'planning').forEach(m => { notes[m.id] = ''; });
      setChangeNotes(notes);
    } catch (err) {
      setError(err.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProjectData(); }, [fetchProjectData]);

  // ── Draft helpers ─────────────────────────────────────────────────────────
  const addDraft    = () => setDrafts(p => [...p, { localId: Date.now(), title: '', content: '', amount: '', delivery_days: '', change_request_note: null }]);
  const removeDraft = (lid) => setDrafts(p => p.filter(d => d.localId !== lid));
  const editDraft   = (lid, field, val) => setDrafts(p => p.map(d => d.localId === lid ? { ...d, [field]: val } : d));

  // ── Generic async action wrapper ──────────────────────────────────────────
  const wrap = async (fn) => {
    setActionErr('');
    setBusy(true);
    try { await fn(); await fetchProjectData(); }
    catch (e) { setActionErr(e.message || 'An error occurred.'); }
    finally   { setBusy(false); }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmitPlan = () => {
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      if (!d.title.trim()) { setActionErr(`Milestone ${i + 1}: title is required.`); return; }
      if (!d.amount || parseFloat(d.amount) <= 0) { setActionErr(`Milestone ${i + 1}: enter a valid amount.`); return; }
      if (!d.delivery_days || parseInt(d.delivery_days, 10) <= 0) { setActionErr(`Milestone ${i + 1}: enter valid delivery days.`); return; }
    }
    wrap(() => submitMilestonePlan(projectId, drafts.map(d => ({
      title: d.title.trim(),
      content: d.content.trim(),
      amount: parseFloat(d.amount),
      delivery_days: parseInt(d.delivery_days, 10),
    }))));
  };

  const handleApprovePlan = () => {
    if (!window.confirm('Approve the milestone plan? The expert will be able to start working.')) return;
    wrap(() => approveMilestonePlan(projectId));
  };

  const handleRequestChanges = () => {
    wrap(async () => {
      await requestMilestonePlanChanges(projectId, changeNotes);
      setChangesModal(false);
    });
  };

  const handleStart = (id) => {
    if (!window.confirm('Start this milestone? The deadline will be calculated from today.')) return;
    wrap(() => startMilestone(id));
  };

  const handleSubmitDeliverable = () => {
    if (!deliverableForm.url.trim()) { setActionErr('A deliverable URL is required.'); return; }
    wrap(async () => {
      await submitDeliverable(deliverableModal.milestoneId, {
        deliverable_url: deliverableForm.url.trim(),
        deliverable_note: deliverableForm.note.trim(),
      });
      setDeliverableModal({ open: false, milestoneId: null });
    });
  };

  const handleApproveDeliverable = (id) => {
    if (!window.confirm('Approve this deliverable and move to payment?')) return;
    wrap(() => approveDeliverable(id));
  };

  const handleRequestRevision = () => {
    wrap(async () => {
      await requestRevision(revisionModal.milestoneId, revisionNote);
      setRevisionModal({ open: false, milestoneId: null });
    });
  };

  const handlePay = (id) => {
    if (!window.confirm('Confirm payment for this milestone?')) return;
    wrap(async () => {
      const res = await payMilestone(id);
      if (res.projectCompleted) setTimeout(() => alert('🎉 All milestones complete — the project is finished!'), 300);
    });
  };

  const handleCloseProject = () => {
    if (!window.confirm('Close this project? This cannot be undone.')) return;
    wrap(() => closeProject(projectId));
  };

  // ── Loading state ─────────────────────────────────────────────────────────
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
                    {progressPct}% &nbsp;·&nbsp; {sorted.filter(m => ['pending_payment','finished'].includes(m.status)).length}/{sorted.length} done
                  </strong>
                </div>
                <div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', transition: 'width 0.5s ease', borderRadius: '4px' }} />
                </div>
              </div>
            </section>

            {/* ── MILESTONES SECTION ────────────────────────────────── */}
            <section style={CARD}>

              {/* EXPERT — empty or planning/change_requested: show draft builder */}
              {isExp && (phase === 'empty' || phase === 'planning') && (
                <DraftBuilder
                  drafts={drafts}
                  phase={phase}
                  addDraft={addDraft}
                  removeDraft={removeDraft}
                  editDraft={editDraft}
                  onSubmit={handleSubmitPlan}
                  busy={busy}
                />
              )}

              {/* CLIENT — planning phase: plan review */}
              {isCli && phase === 'planning' && (
                <PlanReview
                  milestones={planMilestones}
                  onApprove={handleApprovePlan}
                  onRequestChanges={() => setChangesModal(true)}
                  busy={busy}
                />
              )}

              {/* BOTH — active phase: full milestone table */}
              {phase === 'active' && (
                <MilestoneTable
                  milestones={sorted}
                  role={role}
                  startable={startable}
                  onStart={handleStart}
                  onOpenDeliverable={(id) => { setDeliverableModal({ open: true, milestoneId: id }); setDeliverableForm({ url: '', note: '' }); setActionErr(''); }}
                  onApproveDeliverable={handleApproveDeliverable}
                  onOpenRevision={(id) => { setRevisionModal({ open: true, milestoneId: id }); setRevisionNote(''); setActionErr(''); }}
                  onPay={handlePay}
                  busy={busy}
                />
              )}

              {/* CLIENT — no milestones yet */}
              {isCli && phase === 'empty' && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.35)' }}>
                  <Info size={44} style={{ opacity: 0.18, marginBottom: '16px' }} />
                  <h4 style={{ color: '#fff', marginBottom: '8px' }}>Waiting for the Expert</h4>
                  <p style={{ fontSize: '0.9rem' }}>The expert has not submitted a milestone plan yet.</p>
                </div>
              )}
            </section>
          </div>
        )}

        <Footer variant="dashboard" />
      </main>

      {/* ── MODAL: Submit Deliverable ──────────────────────────────────── */}
      {deliverableModal.open && (
        <div style={MODAL_OVERLAY} onClick={() => setDeliverableModal({ open: false, milestoneId: null })}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <ModalHeader title="Submit Deliverable" onClose={() => setDeliverableModal({ open: false, milestoneId: null })} />
            <div style={{ marginBottom: '16px' }}>
              <label style={labelSt}>DELIVERABLE URL *</label>
              <input
                style={inputSt}
                type="url"
                placeholder="https://github.com/repo  or  https://drive.google.com/..."
                value={deliverableForm.url}
                onChange={e => { setActionErr(''); setDeliverableForm(p => ({ ...p, url: e.target.value })); }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelSt}>NOTE (optional)</label>
              <textarea
                style={{ ...inputSt, resize: 'vertical', minHeight: '80px' }}
                placeholder="Briefly describe what you've delivered..."
                value={deliverableForm.note}
                onChange={e => setDeliverableForm(p => ({ ...p, note: e.target.value }))}
              />
            </div>
            {actionErr && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '0.88rem' }}>{actionErr}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button style={btnOutline} onClick={() => setDeliverableModal({ open: false, milestoneId: null })} disabled={busy}>Cancel</button>
              <button style={btnGreen} onClick={handleSubmitDeliverable} disabled={busy}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Client Request Plan Changes ────────────────────────── */}
      {changesModal && (
        <div style={MODAL_OVERLAY} onClick={() => setChangesModal(false)}>
          <div style={{ ...MODAL_BOX, maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <ModalHeader title="Request Plan Changes" onClose={() => setChangesModal(false)} />
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Leave a note for each milestone that needs changes. Blank notes are still saved.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '360px', overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
              {planMilestones.map((m, idx) => (
                <div key={m.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', color: '#fff', marginBottom: '8px', fontSize: '0.93rem' }}>
                    #{idx + 1} {m.title}
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: '400', fontSize: '0.82rem', marginLeft: '8px' }}>{fmtMoney(m.amount)} · {m.delivery_days}d</span>
                  </div>
                  <textarea
                    style={{ ...inputSt, resize: 'vertical', minHeight: '58px', fontSize: '0.88rem' }}
                    placeholder="What needs to change in this milestone?"
                    value={changeNotes[m.id] || ''}
                    onChange={e => setChangeNotes(p => ({ ...p, [m.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {actionErr && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '0.88rem' }}>{actionErr}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button style={btnOutline} onClick={() => setChangesModal(false)} disabled={busy}>Cancel</button>
              <button style={btnAmber} onClick={handleRequestChanges} disabled={busy}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : null} Send Change Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Client Request Revision ────────────────────────────── */}
      {revisionModal.open && (
        <div style={MODAL_OVERLAY} onClick={() => setRevisionModal({ open: false, milestoneId: null })}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <ModalHeader title="Request Revision" onClose={() => setRevisionModal({ open: false, milestoneId: null })} />
            <div style={{ marginBottom: '24px' }}>
              <label style={labelSt}>REVISION NOTE</label>
              <textarea
                style={{ ...inputSt, resize: 'vertical', minHeight: '110px' }}
                placeholder="Describe what needs to be changed or improved..."
                value={revisionNote}
                onChange={e => setRevisionNote(e.target.value)}
              />
            </div>
            {actionErr && <p style={{ color: '#f87171', marginBottom: '12px', fontSize: '0.88rem' }}>{actionErr}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button style={btnOutline} onClick={() => setRevisionModal({ open: false, milestoneId: null })} disabled={busy}>Cancel</button>
              <button style={btnAmber} onClick={handleRequestRevision} disabled={busy}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : null} Request Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
        <X size={22} />
      </button>
    </div>
  );
}

/** Expert's local draft builder — used for both empty state and re-planning after change_requested */
function DraftBuilder({ drafts, phase, addDraft, removeDraft, editDraft, onSubmit, busy }) {
  const hasNotes = drafts.some(d => d.change_request_note);
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 6px 0' }}>
          {phase === 'planning' ? (hasNotes ? '📋 Resubmit Milestone Plan' : '⏳ Plan Submitted — Awaiting Review') : '📋 Plan Your Milestones'}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.88rem' }}>
          {phase === 'planning'
            ? hasNotes
              ? 'The client has requested changes. Review their notes below, edit as needed, and resubmit.'
              : 'Your plan is under client review. You may edit and resubmit at any time.'
            : 'Define each stage of your project. Add all milestones, then submit for client approval.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        {drafts.map((d, idx) => (
          <div
            key={d.localId}
            style={{
              background: 'rgba(0,0,0,0.18)',
              border: `1px solid ${d.change_request_note ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)'}`,
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

            {d.change_request_note && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#fbbf24', fontSize: '0.83rem', lineHeight: '1.5' }}>
                ⚠ Client note: {d.change_request_note}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={labelSt}>TITLE *</label>
              <input style={inputSt} type="text" placeholder="e.g. Frontend UI Implementation" value={d.title} onChange={e => editDraft(d.localId, 'title', e.target.value)} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelSt}>DELIVERABLE DETAILS</label>
              <textarea
                style={{ ...inputSt, resize: 'vertical', minHeight: '68px', fontSize: '0.88rem' }}
                placeholder="Describe what you will deliver in this milestone..."
                value={d.content}
                onChange={e => editDraft(d.localId, 'content', e.target.value)}
              />
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

/** Client's read-only plan review with approve / request-changes buttons */
function PlanReview({ milestones, onApprove, onRequestChanges, busy }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 6px 0' }}>Expert's Milestone Plan</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.88rem' }}>Review each milestone and approve or request changes.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnRed} onClick={onRequestChanges} disabled={busy}>Request Changes</button>
          <button style={btnGreen} onClick={onApprove} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approve Plan
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {milestones.map((m, idx) => (
          <div key={m.id} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#fff', fontSize: '0.97rem' }}>#{idx + 1} {m.title}</strong>
                {m.content && <p style={{ color: 'rgba(255,255,255,0.5)', margin: '5px 0 0 0', fontSize: '0.86rem', lineHeight: '1.5' }}>{m.content}</p>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <strong style={{ color: '#10b981', fontSize: '1.08rem', display: 'block' }}>{fmtMoney(m.amount)}</strong>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem' }}>{m.delivery_days} day{m.delivery_days !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', marginTop: '20px', textAlign: 'right' }}>
        Total: {fmtMoney(milestones.reduce((s, m) => s + parseFloat(m.amount || 0), 0))} across {milestones.length} milestones
      </p>
    </div>
  );
}

/** Active milestone table — shown once plan is approved and work begins */
function MilestoneTable({ milestones, role, startable, onStart, onOpenDeliverable, onApproveDeliverable, onOpenRevision, onPay, busy }) {
  const isExp = role === 'expert';
  const isCli = role === 'client';

  return (
    <div>
      <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Milestone Breakdown</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'rgba(255,255,255,0.8)', minWidth: '720px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.09)', textAlign: 'left', fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', fontWeight: '700', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 12px' }}>#</th>
              <th style={{ padding: '10px 12px' }}>MILESTONE</th>
              <th style={{ padding: '10px 12px' }}>AMOUNT</th>
              <th style={{ padding: '10px 12px' }}>DURATION</th>
              <th style={{ padding: '10px 12px' }}>DEADLINE</th>
              <th style={{ padding: '10px 12px' }}>STATUS</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '18px 12px', color: 'rgba(255,255,255,0.28)', fontWeight: '700', fontSize: '0.9rem' }}>{m.position}</td>

                <td style={{ padding: '18px 12px', maxWidth: '280px' }}>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '3px' }}>{m.title}</strong>
                  {m.content && <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.82rem', display: 'block', lineHeight: '1.4' }}>{m.content}</span>}
                  {/* Change / revision note */}
                  {m.change_request_note && (
                    <div style={{ marginTop: '7px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', padding: '7px 11px', color: '#fbbf24', fontSize: '0.79rem', lineHeight: '1.4' }}>
                      ⚠ {m.change_request_note}
                    </div>
                  )}
                  {/* Deliverable link */}
                  {m.deliverable_url && ['submitted', 'revision_requested', 'pending_payment', 'finished'].includes(m.status) && (
                    <a
                      href={m.deliverable_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#60a5fa', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} /> View Deliverable
                    </a>
                  )}
                  {m.deliverable_note && ['submitted','revision_requested','pending_payment','finished'].includes(m.status) && (
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.79rem', margin: '3px 0 0 0' }}>{m.deliverable_note}</p>
                  )}
                </td>

                <td style={{ padding: '18px 12px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap' }}>{fmtMoney(m.amount)}</td>
                <td style={{ padding: '18px 12px', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{m.delivery_days}d</td>
                <td style={{ padding: '18px 12px', color: 'rgba(255,255,255,0.55)', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>{fmtDate(m.deadline)}</td>
                <td style={{ padding: '18px 12px' }}><StatusBadge status={m.status} /></td>

                <td style={{ padding: '18px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>

                    {/* EXPERT actions */}
                    {isExp && startable?.id === m.id && (
                      <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onStart(m.id)} disabled={busy}>
                        Start
                      </button>
                    )}
                    {isExp && ['ongoing', 'revision_requested'].includes(m.status) && (
                      <button style={{ ...btnPurple, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onOpenDeliverable(m.id)} disabled={busy}>
                        <Send size={13} /> Submit Deliverable
                      </button>
                    )}

                    {/* CLIENT actions */}
                    {isCli && m.status === 'submitted' && (
                      <>
                        <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onApproveDeliverable(m.id)} disabled={busy}>
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button
                          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', borderRadius: '8px', padding: '6px 14px', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => onOpenRevision(m.id)}
                          disabled={busy}
                        >
                          Revise
                        </button>
                      </>
                    )}
                    {isCli && m.status === 'pending_payment' && (
                      <button style={{ ...btnIndigo, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onPay(m.id)} disabled={busy}>
                        <CreditCard size={13} /> Pay
                      </button>
                    )}

                    {/* Finished indicator */}
                    {m.status === 'finished' && (
                      <span style={{ color: '#34d399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <CheckCircle2 size={14} /> Paid
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

