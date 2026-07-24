import DisputeCaseCard from './DisputeCaseCard'

const DisputeCaseList = ({ cases, selectedCaseId, onSelectCase, onResolveCase }) => (
  <div className="dispute-case-list">
    {cases.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
        No dispute cases found matching the current search / filter criteria.
      </div>
    ) : (
      cases.map((item) => (
        <DisputeCaseCard
          item={item}
          key={item.id}
          isSelected={selectedCaseId === item.id}
          onSelect={() => onSelectCase(item.id)}
          onResolve={() => onResolveCase(item)}
        />
      ))
    )}
  </div>
)

export default DisputeCaseList
