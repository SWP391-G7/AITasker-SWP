import { CheckCircle2, Clock, Code2 } from 'lucide-react'

const TechnicalStackCard = ({ skills }) => (
  <div className="admin-panel-card expert-stack-card">
    <div className="panel-header">
      <h2 className="panel-title">Technical Stack</h2>
      <Code2 size={18} className="text-primary" />
    </div>
    <div className="expert-skill-list">
      {skills && skills.length > 0 ? (
        skills.map((skill) => (
          <span key={skill} className="expert-skill-chip">{skill}</span>
        ))
      ) : (
        <span className="text-muted small pb-2 d-inline-block">No skills listed. Update your profile settings.</span>
      )}
    </div>
    <div className="expert-kpi-list">
      <div className="expert-kpi-row">
        <span><CheckCircle2 size={15} /> Project Success Rate</span>
        <strong>100%</strong>
      </div>
      <div className="expert-progress"><span style={{ width: '100%' }}></span></div>
      <div className="expert-kpi-row">
        <span><Clock size={15} /> On-Time Delivery</span>
        <strong>98%</strong>
      </div>
      <div className="expert-progress"><span style={{ width: '98%' }}></span></div>
    </div>
  </div>
)

export default TechnicalStackCard
