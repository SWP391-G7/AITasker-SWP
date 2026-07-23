import { CreditCard, Layers3, WalletCards, X } from 'lucide-react'

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function PaymentSourceDialog({ open, title, amount, availableBalance, busy, onClose, onSelect }) {
  if (!open) return null
  const options = [
    { id: 'combined', icon: Layers3, label: 'Wallet + Card', description: 'Use available wallet credit first, then charge the remainder to card.' },
    { id: 'wallet', icon: WalletCards, label: 'Wallet balance', description: 'Pay the full amount using available, unlocked wallet credit.' },
    { id: 'card', icon: CreditCard, label: 'Credit card', description: 'Charge the full amount to the mock payment gateway.' },
  ]
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(event) => event.stopPropagation()} style={{ width: 'min(92vw, 680px)', maxWidth: '680px', padding: '28px', textAlign: 'left', background: '#0b1220', border: '1px solid rgba(255,255,255,.12)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
          <div>
            <p style={{ margin: '0 0 6px', color: '#818cf8', fontWeight: 800, fontSize: 12, letterSpacing: '.08em' }}>FUND PROJECT ESCROW</p>
            <h3 style={{ margin: 0, fontSize: 22 }}>{title || 'Choose payment source'}</h3>
            <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>Total to secure: <strong style={{ color: '#fff' }}>{money(amount)}</strong>{availableBalance !== undefined ? ` · Available wallet: ${money(availableBalance)}` : ''}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" style={{ alignSelf: 'flex-start', border: 0, background: 'transparent', color: '#94a3b8' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {options.map(({ id, icon: Icon, label, description }) => (
            <button key={id} type="button" disabled={busy} onClick={() => onSelect(id)} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', alignItems: 'center', gap: 14, width: '100%', padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.035)', color: '#fff', textAlign: 'left', cursor: busy ? 'wait' : 'pointer' }}>
              <span style={{ width: 44, height: 44, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(99,102,241,.16)', color: '#a5b4fc' }}><Icon size={21} /></span>
              <span><strong style={{ display: 'block', marginBottom: 3 }}>{label}</strong><small style={{ color: '#94a3b8', lineHeight: 1.4 }}>{description}</small></span>
              <span style={{ color: '#818cf8', fontWeight: 800 }}>Select</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
