/**
 * Frontend module: Components/Dashboard/Admin/DisputeResolution/ChatSummaryPanel.jsx
 *
 * Vai trò: Component Chat Summary Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { MessageSquareText, User } from 'lucide-react'

// React component “Chat Summary Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ChatSummaryPanel = ({ dispute }) => {
  let messages = []
  if (dispute?.message_log) {
    try {
      messages = typeof dispute.message_log === 'string' ? JSON.parse(dispute.message_log) : dispute.message_log
    } catch {
      messages = []
    }
  }

  return (
    <aside className="dispute-side-panel">
      <h2>Project Chat Logs (Auto-Linked)</h2>

      {!dispute ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>Select a dispute case to view conversation history.</p>
      ) : messages.length === 0 ? (
        <div className="chat-summary-box">
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.88rem' }}>
            No prior conversation history recorded between client ({dispute.client_name}) and expert ({dispute.expert_name}).
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.78rem', color: '#60a5fa', fontWeight: '600' }}>
                <span>{msg.sender_name || 'Participant'}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {msg.send_at ? new Date(msg.send_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

export default ChatSummaryPanel
