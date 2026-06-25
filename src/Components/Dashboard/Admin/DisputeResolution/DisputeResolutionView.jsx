import { useMemo, useState } from 'react'
import ChatSummaryPanel from './ChatSummaryPanel'
import DisputeCaseFilters from './DisputeCaseFilters'
import DisputeCaseList from './DisputeCaseList'
import DisputeResolutionStats from './DisputeResolutionStats'
import { disputeCases, disputeFilters, disputeStats, evidenceFiles } from './disputeResolutionData'
import EvidencePreviewPanel from './EvidencePreviewPanel'

const DisputeResolutionView = ({ searchQuery: externalSearchQuery }) => {
  const [activeFilter, setActiveFilter] = useState('All Cases')
  const searchQuery = externalSearchQuery ?? ''

  const filteredCases = useMemo(() => {
    return disputeCases.filter((item) => {
      const matchesFilter = activeFilter === 'All Cases' || item.status === activeFilter
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expert.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, searchQuery])

  return (
    <>
      <DisputeResolutionStats stats={disputeStats} />

      <section className="dispute-workspace">
        <div className="dispute-cases-column">
          <DisputeCaseFilters
            activeFilter={activeFilter}
            filters={disputeFilters}
            onFilterChange={setActiveFilter}
          />
          <DisputeCaseList cases={filteredCases} />
        </div>

        <div className="dispute-side-column">
          <EvidencePreviewPanel files={evidenceFiles} />
          <ChatSummaryPanel />
        </div>
      </section>
    </>
  )
}

export default DisputeResolutionView
