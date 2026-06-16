import { Download, FileText, PlayCircle } from 'lucide-react'

const EvidencePreviewPanel = ({ files }) => (
  <aside className="dispute-side-panel">
    <h2>Evidence Preview</h2>

    <div className="evidence-preview-window">
      <div className="evidence-chart-lines"></div>
      <PlayCircle size={34} />
    </div>

    <div className="evidence-file-list">
      {files.map((file) => (
        <div className="evidence-file-row" key={file.name}>
          <FileText size={17} />
          <div>
            <strong>{file.name}</strong>
            <span>{file.meta}</span>
          </div>
          <Download size={15} />
        </div>
      ))}
    </div>
  </aside>
)

export default EvidencePreviewPanel
