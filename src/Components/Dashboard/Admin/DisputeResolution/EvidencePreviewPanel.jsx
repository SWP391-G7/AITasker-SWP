import { Download, ExternalLink, FileText, ShieldAlert } from 'lucide-react'

const EvidencePreviewPanel = ({ dispute }) => {
  let evidenceList = []
  if (dispute?.evidence_urls) {
    if (Array.isArray(dispute.evidence_urls)) {
      evidenceList = dispute.evidence_urls
    } else {
      try {
        const parsed = JSON.parse(dispute.evidence_urls)
        evidenceList = Array.isArray(parsed) ? parsed : [dispute.evidence_urls]
      } catch {
        evidenceList = dispute.evidence_urls.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
  }

  return (
    <aside className="dispute-side-panel">
      <h2>Evidence & Attachments</h2>

      {!dispute ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>Select a dispute case to view attached evidence links.</p>
      ) : evidenceList.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          No additional external evidence links were attached for this dispute.
        </div>
      ) : (
        <div className="evidence-file-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {evidenceList.map((url, idx) => (
            <a
              className="evidence-file-row"
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <FileText size={17} style={{ color: '#60a5fa' }} />
              <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem' }}>Evidence Link #{idx + 1}</strong>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{url}</span>
              </div>
              <ExternalLink size={15} style={{ color: '#60a5fa' }} />
            </a>
          ))}
        </div>
      )}
    </aside>
  )
}

export default EvidencePreviewPanel
