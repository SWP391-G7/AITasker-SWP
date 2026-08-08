import { useState } from 'react'
import { Wallet, X, CheckCircle, AlertCircle, Building2, CreditCard, Clock, ShieldCheck } from 'lucide-react'
import { requestWithdrawalAPI } from '../../../../Services/transactionService'

const WithdrawalModal = ({ isOpen, onClose, availableBalance = '$0.00', availableNumeric = 0, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer')
  const [accountDetails, setAccountDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successResult, setSuccessResult] = useState(null)

  if (!isOpen) return null

  const handleQuickPercent = (pct) => {
    const calc = (availableNumeric * pct).toFixed(2)
    setAmount(calc)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const val = parseFloat(amount)
    if (!val || isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid amount greater than $0.00')
      return
    }

    if (val > availableNumeric) {
      setErrorMsg(`Amount cannot exceed your available balance of ${availableBalance}`)
      return
    }

    try {
      setIsSubmitting(true)
      const res = await requestWithdrawalAPI({
        amount: val,
        payout_method: payoutMethod === 'bank_transfer' ? 'Bank Wire Transfer' : 'PayPal Payout',
        account_details: accountDetails || (payoutMethod === 'bank_transfer' ? 'Connected Bank Account (*4892)' : 'Primary PayPal Account')
      })

      if (res && res.success) {
        setSuccessResult(res.withdrawal)
        if (onSuccess) onSuccess()
      } else {
        setErrorMsg(res?.message || 'Failed to submit withdrawal request.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while submitting withdrawal request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setErrorMsg('')
    setSuccessResult(null)
    onClose()
  }

  return (
    <div className="withdrawal-modal-overlay">
      <div className="withdrawal-modal-content">
        <div className="withdrawal-modal-header">
          <div className="modal-header-title">
            <div className="modal-title-icon">
              <Wallet size={20} />
            </div>
            <div>
              <h3>Withdraw Funds</h3>
              <p>Transfer your earnings securely to your bank or wallet</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose} type="button">
            <X size={20} />
          </button>
        </div>

        {successResult ? (
          <div className="withdrawal-success-view">
            <div className="success-icon-badge">
              <CheckCircle size={48} color="#10B981" />
            </div>
            <h4>Withdrawal Request Submitted!</h4>
            <p className="success-subtitle">
              Your request of <strong>${successResult.amount?.toFixed(2)}</strong> has been received and queued for processing.
            </p>

            <div className="withdrawal-details-card">
              <div className="detail-row">
                <span>Reference Number:</span>
                <strong className="ref-code">{successResult.referenceNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Payout Method:</span>
                <strong>{successResult.payoutMethod}</strong>
              </div>
              <div className="detail-row">
                <span>Account Info:</span>
                <strong>{successResult.accountDetails}</strong>
              </div>
              <div className="detail-row">
                <span>Est. Clearance:</span>
                <span className="clearance-badge">
                  <Clock size={13} style={{ marginRight: '4px' }} />
                  {successResult.estimatedClearance}
                </span>
              </div>
            </div>

            <button className="btn-modal-done" onClick={handleClose} type="button">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="withdrawal-form">
            <div className="modal-balance-banner">
              <div>
                <span className="banner-label">Available Balance</span>
                <div className="banner-value">{availableBalance}</div>
              </div>
              <div className="secured-badge">
                <ShieldCheck size={16} /> Escrow Protected
              </div>
            </div>

            {errorMsg && (
              <div className="withdrawal-error-alert">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label>Withdrawal Amount (USD)</label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={availableNumeric}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="quick-amount-buttons">
                <button type="button" onClick={() => handleQuickPercent(0.25)}>25%</button>
                <button type="button" onClick={() => handleQuickPercent(0.50)}>50%</button>
                <button type="button" onClick={() => handleQuickPercent(0.75)}>75%</button>
                <button type="button" onClick={() => handleQuickPercent(1.00)}>Max (100%)</button>
              </div>
            </div>

            <div className="form-group">
              <label>Select Payout Method</label>
              <div className="payout-method-options">
                <div
                  className={`payout-option ${payoutMethod === 'bank_transfer' ? 'selected' : ''}`}
                  onClick={() => setPayoutMethod('bank_transfer')}
                >
                  <Building2 size={22} />
                  <div>
                    <strong>Direct Bank Wire</strong>
                    <span>1-3 Business Days</span>
                  </div>
                </div>
                <div
                  className={`payout-option ${payoutMethod === 'paypal' ? 'selected' : ''}`}
                  onClick={() => setPayoutMethod('paypal')}
                >
                  <CreditCard size={22} />
                  <div>
                    <strong>PayPal Account</strong>
                    <span>Instant / 24 Hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Payout Account Details (Optional / Override)</label>
              <input
                type="text"
                placeholder={payoutMethod === 'bank_transfer' ? 'Bank Account / IBAN (*optional)' : 'PayPal Email (*optional)'}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
              />
              <span className="input-hint">Defaults to your verified payout profile if left blank.</span>
            </div>

            <div className="withdrawal-modal-actions">
              <button className="btn-modal-cancel" type="button" onClick={handleClose}>
                Cancel
              </button>
              <button className="btn-modal-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default WithdrawalModal
