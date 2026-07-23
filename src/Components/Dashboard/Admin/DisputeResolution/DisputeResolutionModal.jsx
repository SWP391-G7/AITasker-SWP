/**
 * Frontend module: Components/Dashboard/Admin/DisputeResolution/DisputeResolutionModal.jsx
 *
 * Vai trò: Component Dispute Resolution Modal: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useState } from 'react'
import { AlertTriangle, CheckCircle2, DollarSign, Loader2, Scale, ShieldAlert, UserX, X } from 'lucide-react'

const MODAL_OVERLAY = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1100,
}

const MODAL_BOX = {
  background: '#0d1629',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '16px', padding: '32px',
  width: '90%', maxWidth: '620px',
  boxShadow: '0 24px 56px rgba(0,0,0,0.6)',
  color: '#fff',
}

const labelSt = {
  fontSize: '0.77rem', color: 'rgba(255,255,255,0.45)', fontWeight: '700',
  display: 'block', marginBottom: '6px', letterSpacing: '0.04em'
}

const inputSt = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px', color: '#fff', fontSize: '0.93rem',
  boxSizing: 'border-box',
}

// React component “Dispute Resolution Modal” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
export default function DisputeResolutionModal({ dispute, onClose, onResolved }) {
  const [resolution, setResolution] = useState('refund_client') // 'refund_client' or 'release_expert'
  const [adminNotes, setAdminNotes] = useState('')
  const [applyBan, setApplyBan] = useState(false)
  const [banUserId, setBanUserId] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (!dispute) return null

  const projectTotal = parseFloat(dispute.project_total_amount || 0)
  const releasedAmount = parseFloat(dispute.released_amount || 0)
  const remainingEscrow = Math.max(0, projectTotal - releasedAmount)

  // Handler “handle submit” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleSubmit = async () => {
    setErr('')
    setBusy(true)
    try {
      const payload = {
        resolution,
        admin_notes: adminNotes.trim(),
        apply_ban_user_id: applyBan ? (banUserId || (resolution === 'refund_client' ? dispute.expert_id : dispute.client_id)) : null
      }
      await onResolved(dispute.id || dispute.dispute_id || dispute.project_id, payload)
      onClose()
    } catch (e) {
      setErr(e.message || 'Failed to resolve dispute.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
            <Scale size={22} /> Resolve Dispute — Case #{String(dispute.id || '').slice(-6)}
          </h3>
          <button type="button" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {err && <div className="alert alert-danger" style={{ marginBottom: '16px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '10px 14px', borderRadius: '8px' }}>{err}</div>}

        {/* Case Info Summary */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.05rem' }}>{dispute.title || dispute.project_title || 'Disputed Project'}</h4>
          <p style={{ margin: '0 0 12px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{dispute.content}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Client:</span> <strong style={{ color: '#fff' }}>{dispute.client_name || dispute.creator_name}</strong></div>
            <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Expert:</span> <strong style={{ color: '#fff' }}>{dispute.expert_name || dispute.target_name}</strong></div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>Project Total</span>
            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>${projectTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.08)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'block' }}>Released Payouts</span>
            <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>${releasedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.08)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'block' }}>Disputed Escrow</span>
            <strong style={{ fontSize: '1.1rem', color: '#fbbf24' }}>${remainingEscrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Decision Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelSt}>ADMIN RESOLUTION DECISION *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setResolution('refund_client')}
              style={{
                background: resolution === 'refund_client' ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.03)',
                border: resolution === 'refund_client' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '14px', cursor: 'pointer', textAlign: 'left', color: '#fff'
              }}
            >
              <strong style={{ display: 'block', color: '#60a5fa', marginBottom: '4px' }}>Client Win (Refund Escrow)</strong>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                Refund remaining escrow (${remainingEscrow.toFixed(2)}) back to Client. Mark project terminated.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setResolution('release_expert')}
              style={{
                background: resolution === 'release_expert' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.03)',
                border: resolution === 'release_expert' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '14px', cursor: 'pointer', textAlign: 'left', color: '#fff'
              }}
            >
              <strong style={{ display: 'block', color: '#34d399', marginBottom: '4px' }}>Expert Win (Release Payout)</strong>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                Release remaining escrow (${remainingEscrow.toFixed(2)}) to Expert. Mark project completed.
              </span>
            </button>
          </div>
        </div>

        {/* Admin Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelSt}>ADMIN RESOLUTION NOTES / REASONING</label>
          <textarea
            style={{ ...inputSt, minHeight: '80px', resize: 'vertical' }}
            placeholder="Explain the justification for this decision (will be sent in notification logs)..."
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
          />
        </div>

        {/* Account Penalty Checkbox */}
        <div style={{ marginBottom: '24px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '14px', borderRadius: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={applyBan}
              onChange={e => setApplyBan(e.target.checked)}
            />
            <UserX size={16} /> Apply Account Suspension Penalty
          </label>
          {applyBan && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ ...labelSt, color: '#f87171' }}>SELECT USER TO SUSPEND</label>
              <select
                style={{ ...inputSt, background: '#070c14' }}
                value={banUserId}
                onChange={e => setBanUserId(e.target.value)}
              >
                <option value={dispute.expert_id || dispute.target_id}>Suspend Expert ({dispute.expert_name || dispute.target_name})</option>
                <option value={dispute.client_id || dispute.creator_id}>Suspend Client ({dispute.client_name || dispute.creator_name})</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            style={{ background: resolution === 'refund_client' ? '#2563eb' : '#059669', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : 'Finalize Resolution'}
          </button>
        </div>
      </div>
    </div>
  )
}
