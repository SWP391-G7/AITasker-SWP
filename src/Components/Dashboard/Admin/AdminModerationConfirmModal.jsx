import { AlertTriangle, CheckCircle2, EyeOff, X, XCircle } from 'lucide-react'
import './AdminModerationConfirmModal.css'

const actionConfig = {
  approve: {
    title: 'Approve Content',
    message: 'Are you sure you want to approve this content and publish it to the marketplace?',
    confirmLabel: 'Approve',
    loadingLabel: 'Approving...',
    icon: CheckCircle2,
    tone: 'approve',
  },
  reject: {
    title: 'Reject Content',
    message: 'Are you sure you want to reject this content? It will be marked as removed.',
    confirmLabel: 'Reject',
    loadingLabel: 'Rejecting...',
    icon: XCircle,
    tone: 'danger',
  },
  unpublish: {
    title: 'Unpublish Content',
    message: 'Are you sure you want to unpublish this content? It will no longer be available on the marketplace.',
    confirmLabel: 'Unpublish',
    loadingLabel: 'Unpublishing...',
    icon: EyeOff,
    tone: 'danger',
  },
  republish: {
    title: 'Publish Content Again',
    message: 'Are you sure you want to publish this content again? It will become available on the marketplace.',
    confirmLabel: 'Publish Again',
    loadingLabel: 'Publishing...',
    icon: CheckCircle2,
    tone: 'approve',
  },
}

const AdminModerationConfirmModal = ({
  action,
  contentTitle,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  if (!action) return null

  const config = actionConfig[action] || actionConfig.unpublish
  const ActionIcon = config.icon || AlertTriangle

  return (
    <div className="admin-moderation-confirm-overlay" role="presentation" onClick={loading ? undefined : onCancel}>
      <section
        className="admin-moderation-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-moderation-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="admin-moderation-confirm-close"
          type="button"
          aria-label="Close confirmation"
          disabled={loading}
          onClick={onCancel}
        >
          <X size={18} />
        </button>

        <div className={`admin-moderation-confirm-icon is-${config.tone}`}>
          <ActionIcon size={24} />
        </div>
        <h2 id="admin-moderation-confirm-title">{config.title}</h2>
        <p>{config.message}</p>
        {contentTitle && <strong className="admin-moderation-confirm-target">{contentTitle}</strong>}

        <div className="admin-moderation-confirm-actions">
          <button type="button" className="is-cancel" disabled={loading} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`is-confirm is-${config.tone}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? config.loadingLabel : config.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminModerationConfirmModal
