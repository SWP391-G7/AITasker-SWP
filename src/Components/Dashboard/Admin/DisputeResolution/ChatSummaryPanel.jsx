import { MessageSquareText } from 'lucide-react'

const ChatSummaryPanel = () => (
  <aside className="dispute-side-panel">
    <h2>Chat Summary (AI Insights)</h2>
    <div className="chat-summary-box">
      <p>
        AI Assistant: Based on the last 50 messages, the dispute centers on "Scope Creep".
        The client added three extra deliverables that were not in the initial contract.
        The expert initially agreed but now requests additional payment.
      </p>
    </div>
    <button className="chat-log-button" type="button">
      <MessageSquareText size={16} />
      Open Full Chat Logs
    </button>
  </aside>
)

export default ChatSummaryPanel
