/**
 * Frontend module: pages/projects/ProjectDetailPage.jsx
 *
 * Vai trò: Page Project Detail Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
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
  ShieldAlert,
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
  requestMilestoneExtension,
  respondMilestoneExtension,
  raiseProjectDispute,
  getProjectDisputeStatus,
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
  disputed:          'On Hold (Disputed)',
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
  disputed:          { bg: 'rgba(239,68,68,0.2)',    color: '#f87171' },
};

// React component “Status Badge” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
// Thực hiện phần logic “fmt money” trong phạm vi trách nhiệm của module hiện tại.
const fmtMoney = (v) => `$${parseFloat(v || 0).toLocaleString()}`;
// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get milestone settlement”; không nên tạo side effect ngoài những request đọc đã nêu trong thân hàm.
const getMilestoneSettlement = (milestone) => {
  const amount = parseFloat(milestone?.amount || 0);
  if (milestone?.status === 'finished' && milestone.released_amount != null) {
    return {
      lateDays: parseInt(milestone.late_days || 0, 10),
      penaltyAmount: parseFloat(milestone.penalty_amount || 0),
      releasedAmount: parseFloat(milestone.released_amount || 0),
    };
  }
  const submittedAt = milestone?.submitted_at ? new Date(milestone.submitted_at) : null;
  const deadline = milestone?.deadline ? new Date(milestone.deadline) : null;
  const lateDays = submittedAt && deadline && submittedAt > deadline
    ? Math.ceil((submittedAt.getTime() - deadline.getTime()) / (24 * 60 * 60 * 1000))
    : 0;
  const penaltyAmount = Math.round(amount * Math.min(lateDays * 0.01, 0.2) * 100) / 100;
  return { lateDays, penaltyAmount, releasedAmount: amount - penaltyAmount };
};
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

  // Modal — file dispute
  const [disputeModal,    setDisputeModal]    = useState({ open: false });
  const [disputeForm,     setDisputeForm]     = useState({ title: '', type: 'Quality Issue', content: '', evidence_urls: '' });
  const [disputeInfo,     setDisputeInfo]     = useState(null);
  const [viewDisputeModal,setViewDisputeModal] = useState(false);


  // User identity from localStorage
  const user  = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }, []);
  const role  = String(user?.role || '').toLowerCase();
  const isExp = role === 'expert';
  const isCli = role === 'client';

  // ── Derived state ──────────────────────────────────────────────────────────
  const isDisputed   = useMemo(() => String(project?.status || '').toLowerCase() === 'disputed', [project]);
  const isTerminated = useMemo(() => ['terminated', 'cancelled'].includes(String(project?.status || '').toLowerCase()), [project]);
  const isInactive   = isDisputed || isTerminated;

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
    if (!isExp || isInactive) return null;
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
  }, [sorted, isExp, isInactive]);


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
      // Thực hiện phần logic “ms” trong phạm vi trách nhiệm của module hiện tại.
      const ms = (data.milestones || []).sort((a, b) => (a.position || 0) - (b.position || 0));
      setMilestones(ms);

      try {
        const dData = await getProjectDisputeStatus(projectId);
        setDisputeInfo(dData);
      } catch (dErr) {
        setDisputeInfo(null);
      }

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
  // Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “remove draft”; cần giữ validation và quyền truy cập trước khi cập nhật.
  const removeDraft = (lid) => setDrafts(p => p.filter(d => d.localId !== lid));
  // Thay đổi trạng thái hoặc dữ liệu cho nghiệp vụ “edit draft”; cần giữ validation và quyền truy cập trước khi cập nhật.
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
    const projectTotal = parseFloat(project?.total_amount || 0);
    const planTotal = drafts.reduce((sum, draft) => sum + parseFloat(draft.amount || 0), 0);
    if (projectTotal > 0 && Math.abs(planTotal - projectTotal) > 0.01) {
      setActionErr(`Milestone amounts must total ${fmtMoney(projectTotal)}. Current total: ${fmtMoney(planTotal)}.`);
      return;
    }
    wrap(() => submitMilestonePlan(projectId, drafts.map(d => ({
      title: d.title.trim(),
      content: d.content.trim(),
      amount: parseFloat(d.amount),
      delivery_days: parseInt(d.delivery_days, 10),
    }))));
  };

  // Handler “handle approve plan” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleApprovePlan = () => {
    const projectDuration = parseInt(project?.duration_days || 0, 10);
    const planDuration = planMilestones.reduce((sum, milestone) => sum + parseInt(milestone.delivery_days || 0, 10), 0);
    const approvesExtension = projectDuration > 0 && planDuration > projectDuration;
    const message = approvesExtension
      ? `This plan requests an extension from ${projectDuration} to ${planDuration} days. Approve both the plan and extension?`
      : 'Approve the milestone plan? The expert will be able to start working.';
    if (!window.confirm(message)) return;
    wrap(() => approveMilestonePlan(projectId, approvesExtension));
  };

  // Handler “handle request changes” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleRequestChanges = () => {
    wrap(async () => {
      await requestMilestonePlanChanges(projectId, changeNotes);
      setChangesModal(false);
    });
  };

  // Handler “handle start” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleStart = (id) => {
    if (!window.confirm('Start this milestone? The deadline will be calculated from today.')) return;
    wrap(() => startMilestone(id));
  };

  // Handler “handle submit deliverable” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
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

  // Handler “handle approve deliverable” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleApproveDeliverable = (id) => {
    const milestone = milestones.find(item => item.id === id);
    const settlement = getMilestoneSettlement(milestone);
    const message = settlement.lateDays > 0
      ? `This deliverable is ${settlement.lateDays} day(s) late. Approving deducts ${fmtMoney(settlement.penaltyAmount)} and releases ${fmtMoney(settlement.releasedAmount)} to the expert. Continue?`
      : 'Approve this deliverable and release its agreed milestone amount from escrow?';
    if (!window.confirm(message)) return;
    wrap(() => approveDeliverable(id));
  };

  // Handler “handle request revision” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleRequestRevision = () => {
    wrap(async () => {
      await requestRevision(revisionModal.milestoneId, revisionNote);
      setRevisionModal({ open: false, milestoneId: null });
    });
  };

  // Handler “handle request extension” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleRequestExtension = (id) => {
    const daysInput = window.prompt('How many additional days do you need? (1-90)');
    if (daysInput === null) return;
    const additionalDays = parseInt(daysInput, 10);
    if (!Number.isInteger(additionalDays) || additionalDays < 1 || additionalDays > 90) {
      setActionErr('Additional days must be between 1 and 90.');
      return;
    }
    const reason = window.prompt('Explain why the extension is needed (at least 10 characters):');
    if (reason === null) return;
    if (reason.trim().length < 10) {
      setActionErr('Extension reason must be at least 10 characters.');
      return;
    }
    wrap(() => requestMilestoneExtension(id, additionalDays, reason.trim()));
  };

  // Handler “handle respond extension” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleRespondExtension = (id, action) => {
    const milestone = milestones.find(item => item.id === id);
    const days = milestone?.extension_requested_days || 0;
    if (action === 'approve') {
      if (!window.confirm(`Approve ${days} additional day(s)? This updates the milestone deadline and project duration.`)) return;
      wrap(() => respondMilestoneExtension(id, 'approve'));
      return;
    }
    const note = window.prompt('Why are you rejecting this extension request?');
    if (note === null) return;
    wrap(() => respondMilestoneExtension(id, 'reject', note.trim()));
  };

  // Handler “handle pay” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handlePay = (id) => {
    if (!window.confirm('Confirm payment for this milestone?')) return;
    wrap(async () => {
      const res = await payMilestone(id);
      if (res.projectCompleted) setTimeout(() => alert('🎉 All milestones complete — the project is finished!'), 300);
    });
  };

  // Handler “handle close project” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleCloseProject = () => {
    if (!window.confirm('Close this project? This cannot be undone.')) return;
    wrap(() => closeProject(projectId));
  };

  // Handler “handle raise dispute” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleRaiseDispute = () => {
    if (!disputeForm.title.trim() || !disputeForm.content.trim()) {
      setActionErr('Dispute title and description are required.');
      return;
    }
    const evidenceArray = disputeForm.evidence_urls
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    wrap(async () => {
      await raiseProjectDispute(projectId, {
        title: disputeForm.title.trim(),
        type: disputeForm.type,
        content: disputeForm.content.trim(),
        evidence_urls: evidenceArray,
      });
      setDisputeModal({ open: false });
      setDisputeForm({ title: '', type: 'Quality Issue', content: '', evidence_urls: '' });
    });
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

        {project && (
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
                  {disputeInfo && (
                    <button type="button" style={{ ...btnOutline, borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }} onClick={() => setViewDisputeModal(true)}>
                      <ShieldAlert size={14} style={{ marginRight: '4px', display: 'inline' }} /> Dispute Details
                    </button>
                  )}
                  {!isInactive && String(project.status).toLowerCase() !== 'completed' && (
                    <button style={btnRed} onClick={() => setDisputeModal({ open: true })} disabled={busy}>
                      <ShieldAlert size={14} style={{ marginRight: '4px', display: 'inline' }} /> Raise Dispute
                    </button>
                  )}
                  {isCli && project.status === 'active' && (
                    <button style={btnRed} onClick={handleCloseProject} disabled={busy}>Abandon Project</button>
                  )}
                </div>
              </div>

              {String(project.status).toLowerCase() === 'disputed' && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
                    <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1rem' }}>Project On Hold — Dispute Under Review</h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                        A dispute has been filed for this project. Escrow funds and milestone operations are currently frozen while platform administration reviews evidence and chat logs. Both parties are restricted from modifying project milestones during this time.
                      </p>
                    </div>
                  </div>
                  {disputeInfo && (
                    <button type="button" style={{ ...btnOutline, background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.35)', color: '#fff', padding: '8px 16px', fontSize: '0.84rem' }} onClick={() => setViewDisputeModal(true)}>
                      <ShieldAlert size={14} style={{ marginRight: '4px', display: 'inline' }} /> View Filed Dispute
                    </button>
                  )}
                </div>
              )}

              {isTerminated && !disputeInfo?.is_resolved && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
                    <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1rem' }}>
                        This project has been terminated
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
                        This project is closed and read-only. You can view project details and milestone progress below, but all interaction controls have been disabled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {disputeInfo && disputeInfo.is_resolved && (
                <div style={{ background: disputeInfo.resolution_type === 'refund_client' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${disputeInfo.resolution_type === 'refund_client' ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '12px', padding: '16px 20px', color: '#fff', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <CheckCircle2 size={20} style={{ color: disputeInfo.resolution_type === 'refund_client' ? '#60a5fa' : '#34d399' }} />
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
                        This project has been terminated due to dispute resolution ({disputeInfo.resolution_type === 'refund_client' ? 'Client Win — Escrow Refunded' : 'Expert Win — Escrow Released'})
                      </h4>
                    </div>
                    {disputeInfo.admin_notes && (
                      <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: '1.4' }}>
                        <strong>Admin Explanation:</strong> "{disputeInfo.admin_notes}"
                      </p>
                    )}
                  </div>
                  <button type="button" style={{ ...btnOutline, background: 'rgba(255,255,255,0.05)', padding: '8px 16px', fontSize: '0.84rem' }} onClick={() => setViewDisputeModal(true)}>
                    <ShieldAlert size={14} style={{ marginRight: '4px', display: 'inline' }} /> View Full Dispute Case
                  </button>
                </div>
              )}





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
                <div>
                  <span style={labelSt}>PROJECT DURATION</span>
                  <strong style={{ color: '#fff', display: 'block' }}>
                    {project.duration_days ? `${project.duration_days} days` : 'Not specified'}
                  </strong>
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
                  projectTotal={parseFloat(project?.total_amount || 0)}
                  projectDuration={parseInt(project?.duration_days || 0, 10)}
                  phase={phase}
                  addDraft={addDraft}
                  removeDraft={removeDraft}
                  editDraft={editDraft}
                  onSubmit={handleSubmitPlan}
                  busy={busy}
                  isDisputed={isInactive}
                />
              )}

              {/* CLIENT — planning phase: plan review */}
              {isCli && phase === 'planning' && (
                <PlanReview
                  milestones={planMilestones}
                  projectTotal={parseFloat(project?.total_amount || 0)}
                  projectDuration={parseInt(project?.duration_days || 0, 10)}
                  onApprove={handleApprovePlan}
                  onRequestChanges={() => setChangesModal(true)}
                  busy={busy}
                  isDisputed={isInactive}
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
                  onRequestExtension={handleRequestExtension}
                  onRespondExtension={handleRespondExtension}
                  onPay={handlePay}
                  busy={busy}
                  isDisputed={isInactive}
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

      {/* ── MODAL: File Dispute ───────────────────────────────────────── */}
      {disputeModal.open && (
        <div style={MODAL_OVERLAY} onClick={() => setDisputeModal({ open: false })}>
          <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                <ShieldAlert size={20} /> File Project Dispute
              </h3>
              <button type="button" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setDisputeModal({ open: false })}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Filing a dispute will place this project on hold and freeze all unreleased escrow payouts while an admin reviews your case, evidence, and conversation logs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelSt}>DISPUTE TITLE *</label>
                <input
                  type="text"
                  style={inputSt}
                  placeholder="e.g., Deliverable quality does not meet agreement"
                  value={disputeForm.title}
                  onChange={e => setDisputeForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label style={labelSt}>REASON / CATEGORY</label>
                <select
                  style={{ ...inputSt, background: '#070c14' }}
                  value={disputeForm.type}
                  onChange={e => setDisputeForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="Quality Issue">Work / Deliverable Quality Issue</option>
                  <option value="Missed Deadline">Missed Deadline / Abandonment</option>
                  <option value="Communication Failure">Unresponsive / Communication Breakdown</option>
                  <option value="Scope Disagreement">Scope / Milestone Disagreement</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div>
                <label style={labelSt}>DETAILED DESCRIPTION *</label>
                <textarea
                  style={{ ...inputSt, minHeight: '90px', resize: 'vertical' }}
                  placeholder="Provide a detailed explanation of the issue and why you are filing a dispute..."
                  value={disputeForm.content}
                  onChange={e => setDisputeForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>

              <div>
                <label style={labelSt}>EVIDENCE ATTACHMENT LINKS (OPTIONAL, COMMA-SEPARATED)</label>
                <input
                  type="text"
                  style={inputSt}
                  placeholder="https://drive.google.com/..., https://imgur.com/..."
                  value={disputeForm.evidence_urls}
                  onChange={e => setDisputeForm(f => ({ ...f, evidence_urls: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={btnOutline} onClick={() => setDisputeModal({ open: false })} disabled={busy}>Cancel</button>
              <button type="button" style={btnRed} onClick={handleRaiseDispute} disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: View Dispute Details ───────────────────────────────── */}
      {viewDisputeModal && disputeInfo && (
        <ViewDisputeDetailsModal
          dispute={disputeInfo}
          onClose={() => setViewDisputeModal(false)}
        />
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

/** View filed dispute details modal for Client and Expert */
function ViewDisputeDetailsModal({ dispute, onClose }) {
  if (!dispute) return null;

  let evidenceList = [];
  if (dispute.evidence_urls) {
    if (Array.isArray(dispute.evidence_urls)) {
      evidenceList = dispute.evidence_urls;
    } else {
      try {
        const parsed = JSON.parse(dispute.evidence_urls);
        evidenceList = Array.isArray(parsed) ? parsed : [dispute.evidence_urls];
      } catch {
        evidenceList = String(dispute.evidence_urls).split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }

  let messages = [];
  if (dispute.message_log) {
    try {
      messages = typeof dispute.message_log === 'string' ? JSON.parse(dispute.message_log) : dispute.message_log;
    } catch {
      messages = [];
    }
  }

  const isResolved = dispute.is_resolved;

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div style={{ ...MODAL_BOX, maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
            <ShieldAlert size={20} /> Dispute Case Details
          </h3>
          <button type="button" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>CASE ID</span>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>#{String(dispute.id || '').slice(0, 8)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>FILED ON</span>
            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{fmtDate(dispute.created_at)}</strong>
          </div>
          <div>
            <StatusBadge status={isResolved ? (dispute.resolution_type === 'refund_client' ? 'terminated' : 'completed') : 'disputed'} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '440px', overflowY: 'auto', paddingRight: '4px' }}>
          <div>
            <span style={labelSt}>CATEGORY & TITLE</span>
            <span style={{ display: 'inline-block', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
              {dispute.type || 'General Dispute'}
            </span>
            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>{dispute.title}</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '8px' }}>
            <div>
              <span style={labelSt}>FILED BY</span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{dispute.creator_name || 'Participant'}</strong>
            </div>
            <div>
              <span style={labelSt}>RESPONDENT</span>
              <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{dispute.target_name || 'Participant'}</strong>
            </div>
          </div>

          <div>
            <span style={labelSt}>FILED STATEMENT / DESCRIPTION</span>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '12px 14px', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {dispute.content}
            </div>
          </div>

          <div>
            <span style={labelSt}>ATTACHED EVIDENCE LINKS ({evidenceList.length})</span>
            {evidenceList.length === 0 ? (
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No external evidence links attached.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evidenceList.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none', background: 'rgba(59,130,246,0.1)', padding: '8px 12px', borderRadius: '6px' }}
                  >
                    <ExternalLink size={14} /> {url}
                  </a>
                ))}
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div>
              <span style={labelSt}>LINKED CONVERSATION MESSAGES ({messages.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                {messages.map((m, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', marginBottom: '2px', fontWeight: 600 }}>
                      <span>{m.sender_name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{m.send_at ? new Date(m.send_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isResolved && (
            <div style={{ background: dispute.resolution_type === 'refund_client' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${dispute.resolution_type === 'refund_client' ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '10px', padding: '14px 16px' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '4px', fontSize: '0.93rem' }}>
                ADMIN DECISION: {dispute.resolution_type === 'refund_client' ? 'Client Win (Escrow Refunded)' : 'Expert Win (Escrow Released)'}
              </strong>
              {dispute.admin_notes ? (
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                  <strong>Explanation:</strong> "{dispute.admin_notes}"
                </p>
              ) : (
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem' }}>No explanation notes provided by admin.</p>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <button type="button" style={btnOutline} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}


/** Expert's local draft builder — used for both empty state and re-planning after change_requested */
function DraftBuilder({ drafts, projectTotal, projectDuration, phase, addDraft, removeDraft, editDraft, onSubmit, busy, isDisputed }) {
  const hasNotes = drafts.some(d => d.change_request_note);
  const draftTotal = drafts.reduce((sum, draft) => sum + parseFloat(draft.amount || 0), 0);
  const draftDays = drafts.reduce((sum, draft) => sum + parseInt(draft.delivery_days || 0, 10), 0);
  const amountMatches = projectTotal <= 0 || Math.abs(draftTotal - projectTotal) <= 0.01;
  const durationExceeded = projectDuration > 0 && draftDays > projectDuration;
  const fieldsValid = drafts.every(d =>
    d.title.trim()
    && parseFloat(d.amount) > 0
    && parseInt(d.delivery_days, 10) > 0
  );
  const canSubmit = fieldsValid && amountMatches && !isDisputed;
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
              {drafts.length > 1 && !isDisputed && (
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
              <input style={inputSt} type="text" placeholder="e.g. Frontend UI Implementation" value={d.title} onChange={e => editDraft(d.localId, 'title', e.target.value)} disabled={isDisputed} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelSt}>DELIVERABLE DETAILS</label>
              <textarea
                style={{ ...inputSt, resize: 'vertical', minHeight: '68px', fontSize: '0.88rem' }}
                placeholder="Describe what you will deliver in this milestone..."
                value={d.content}
                onChange={e => editDraft(d.localId, 'content', e.target.value)}
                disabled={isDisputed}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelSt}>AMOUNT ($) * {projectTotal > 0 && d.amount ? `· ${((parseFloat(d.amount) / projectTotal) * 100).toFixed(1)}%` : ''}</label>
                <input style={inputSt} type="number" min="1" placeholder="e.g. 500" value={d.amount} onChange={e => editDraft(d.localId, 'amount', e.target.value)} disabled={isDisputed} />
                {projectTotal > 0 && parseFloat(d.amount || 0) > projectTotal && (
                  <span style={{ color: '#f87171', fontSize: '0.78rem', display: 'block', marginTop: 6 }}>
                    This milestone exceeds the entire project budget of {fmtMoney(projectTotal)}.
                  </span>
                )}
              </div>
              <div>
                <label style={labelSt}>DELIVERY TIME (DAYS) *</label>
                <input style={inputSt} type="number" min="1" step="1" placeholder="e.g. 14" value={d.delivery_days} onChange={e => editDraft(d.localId, 'delivery_days', e.target.value)} disabled={isDisputed} />
                {projectDuration > 0 && parseInt(d.delivery_days || 0, 10) > projectDuration && (
                  <span style={{ color: '#f87171', fontSize: '0.78rem', display: 'block', marginTop: 6 }}>
                    This milestone alone exceeds the {projectDuration}-day project duration.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', marginBottom: 10, borderRadius: 9, background: amountMatches ? 'rgba(99,102,241,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${amountMatches ? 'rgba(99,102,241,.18)' : 'rgba(239,68,68,.28)'}`, color: amountMatches ? '#c7d2fe' : '#fca5a5' }}>
        <span>Proposed release total</span>
        <strong>{fmtMoney(draftTotal)} / {fmtMoney(projectTotal)} {projectTotal > 0 ? `(${((draftTotal / projectTotal) * 100).toFixed(1)}%)` : ''}</strong>
      </div>
      {!amountMatches && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', margin: '0 0 10px' }}>
          {draftTotal > projectTotal
            ? `Reduce milestone amounts by ${fmtMoney(draftTotal - projectTotal)}.`
            : `Allocate the remaining ${fmtMoney(projectTotal - draftTotal)} before submitting.`}
        </p>
      )}
      {projectDuration > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', marginBottom: 10, borderRadius: 9, background: durationExceeded ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.07)', border: `1px solid ${durationExceeded ? 'rgba(245,158,11,.28)' : 'rgba(16,185,129,.2)'}`, color: durationExceeded ? '#fbbf24' : '#a7f3d0' }}>
          <span>Planned delivery time</span>
          <strong>{draftDays} / {projectDuration} days</strong>
        </div>
      )}
      {durationExceeded && (
        <p style={{ color: '#fbbf24', fontSize: '0.8rem', margin: '0 0 10px' }}>
          This submits a request to extend the project by {draftDays - projectDuration} day{draftDays - projectDuration !== 1 ? 's' : ''}. The client must approve it.
        </p>
      )}

      {!isDisputed ? (
        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
          <button style={btnOutline} onClick={addDraft} disabled={busy}>
            <Plus size={15} style={{ marginRight: '4px', display: 'inline' }} /> Add Milestone
          </button>
          <button style={{ ...btnGreen, marginLeft: 'auto', opacity: canSubmit && !busy ? 1 : 0.55 }} onClick={onSubmit} disabled={busy || !canSubmit}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Submit Plan
          </button>
        </div>
      ) : (
        <div style={{ padding: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#f87171', fontSize: '0.86rem', marginTop: '16px', textAlign: 'center', fontWeight: '600' }}>
          🔒 Planning controls are disabled while project is on hold under dispute review.
        </div>
      )}
    </div>
  );
}

/** Client's read-only plan review with approve / request-changes buttons */
function PlanReview({ milestones, projectTotal, projectDuration, onApprove, onRequestChanges, busy, isDisputed }) {
  const planTotal = milestones.reduce((sum, milestone) => sum + parseFloat(milestone.amount || 0), 0);
  const planDays = milestones.reduce((sum, milestone) => sum + parseInt(milestone.delivery_days || 0, 10), 0);
  const amountValid = projectTotal <= 0 || Math.abs(planTotal - projectTotal) <= 0.01;
  const durationExtensionRequested = projectDuration > 0 && planDays > projectDuration;
  const planValid = amountValid && !isDisputed;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 6px 0' }}>Expert's Milestone Plan</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.88rem' }}>Review each milestone and approve or request changes.</p>
        </div>
        {!isDisputed ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={btnRed} onClick={onRequestChanges} disabled={busy}>Request Changes</button>
            <button style={{ ...btnGreen, opacity: planValid && !busy ? 1 : 0.55 }} onClick={onApprove} disabled={busy || !planValid}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {durationExtensionRequested ? 'Approve Plan & Extension' : 'Approve Plan'}
            </button>
          </div>
        ) : (
          <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>🔒 Plan approval disabled during dispute</span>
        )}
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

      <div style={{ marginTop: '20px', padding: '14px 16px', borderRadius: 9, background: !planValid ? 'rgba(239,68,68,.08)' : durationExtensionRequested ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.07)', border: `1px solid ${!planValid ? 'rgba(239,68,68,.28)' : durationExtensionRequested ? 'rgba(245,158,11,.28)' : 'rgba(16,185,129,.2)'}`, color: !planValid ? '#fca5a5' : durationExtensionRequested ? '#fbbf24' : '#a7f3d0', fontSize: '0.84rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>Release allocation</span>
          <strong>{fmtMoney(planTotal)} / {fmtMoney(projectTotal)}</strong>
        </div>
        {projectDuration > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 7 }}>
            <span>Delivery schedule</span>
            <strong>{planDays} / {projectDuration} days</strong>
          </div>
        )}
        {durationExtensionRequested && <div style={{ marginTop: 8 }}>The expert requests {planDays - projectDuration} extra day{planDays - projectDuration !== 1 ? 's' : ''}. Approving updates the project duration to {planDays} days; otherwise request changes.</div>}
        {!amountValid && <div style={{ marginTop: 8 }}>Milestone amounts must equal the full project budget before approval.</div>}
      </div>
    </div>
  );
}

/** Active milestone table — shown once plan is approved and work begins */
function MilestoneTable({ milestones, role, startable, onStart, onOpenDeliverable, onApproveDeliverable, onOpenRevision, onRequestExtension, onRespondExtension, onPay, busy, isDisputed }) {
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

                <td style={{ padding: '18px 12px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap' }}>
                  {fmtMoney(m.amount)}
                  {getMilestoneSettlement(m).lateDays > 0 && (
                    <span style={{ display: 'block', color: '#f87171', fontSize: '0.73rem', marginTop: 4, fontWeight: 600 }}>
                      -{fmtMoney(getMilestoneSettlement(m).penaltyAmount)} ({getMilestoneSettlement(m).lateDays}d late)
                    </span>
                  )}
                  {m.extension_status && (
                    <div style={{ marginTop: '7px', background: m.extension_status === 'pending' ? 'rgba(245,158,11,0.1)' : m.extension_status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 11px', color: m.extension_status === 'pending' ? '#fbbf24' : m.extension_status === 'approved' ? '#34d399' : '#f87171', fontSize: '0.79rem', lineHeight: '1.4' }}>
                      Extension {m.extension_status}: {m.extension_requested_days} day(s). {m.extension_reason}
                    </div>
                  )}
                  {m.status === 'finished' && m.released_amount != null && (
                    <span style={{ display: 'block', color: '#34d399', fontSize: '0.73rem', marginTop: 3, fontWeight: 600 }}>
                      Released {fmtMoney(m.released_amount)}
                    </span>
                  )}
                </td>
                <td style={{ padding: '18px 12px', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{m.delivery_days}d</td>
                <td style={{ padding: '18px 12px', color: 'rgba(255,255,255,0.55)', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>{fmtDate(m.deadline)}</td>
                <td style={{ padding: '18px 12px' }}><StatusBadge status={m.status} /></td>

                <td style={{ padding: '18px 12px', textAlign: 'right' }}>
                  {isDisputed ? (
                    <span style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🔒 Actions Disabled
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>

                      {/* EXPERT actions */}
                      {isExp && startable?.id === m.id && (
                        <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onStart(m.id)} disabled={busy}>
                          Start
                        </button>
                      )}
                      {isExp && ['ongoing', 'revision_requested'].includes(m.status) && (
                        <>
                          <button style={{ ...btnPurple, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onOpenDeliverable(m.id)} disabled={busy}>
                            <Send size={13} /> Submit Deliverable
                          </button>
                          {m.extension_status !== 'pending' && (
                            <button style={{ ...btnAmber, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onRequestExtension(m.id)} disabled={busy}>
                              Request More Time
                            </button>
                          )}
                        </>
                      )}

                      {/* CLIENT actions */}
                      {isCli && ['submitted', 'submitted_for_review', 'under_review'].includes(m.status) && (
                        <>
                          <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onApproveDeliverable(m.id)} disabled={busy}>
                            <CheckCircle2 size={13} /> Approve & Release {fmtMoney(getMilestoneSettlement(m).releasedAmount)}
                          </button>
                          <button
                            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', borderRadius: '8px', padding: '6px 14px', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer' }}
                            onClick={() => onOpenRevision(m.id)}
                            disabled={busy}
                          >
                            Request Revision
                          </button>
                        </>
                      )}
                      {isCli && m.extension_status === 'pending' && (
                        <>
                          <button style={{ ...btnGreen, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onRespondExtension(m.id, 'approve')} disabled={busy}>Approve Extension</button>
                          <button style={{ ...btnRed, padding: '6px 14px', fontSize: '0.83rem' }} onClick={() => onRespondExtension(m.id, 'reject')} disabled={busy}>Reject Extension</button>
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


