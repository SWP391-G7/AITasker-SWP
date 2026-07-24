import { useEffect, useMemo, useState } from 'react'
import { getAdminDisputes, resolveAdminDispute } from '../../../../Services/adminDashboardService'
import ChatSummaryPanel from './ChatSummaryPanel'
import DisputeCaseFilters from './DisputeCaseFilters'
import DisputeCaseList from './DisputeCaseList'
import DisputeResolutionModal from './DisputeResolutionModal'
import DisputeResolutionStats from './DisputeResolutionStats'
import EvidencePreviewPanel from './EvidencePreviewPanel'

const disputeFilters = ['All Cases', 'Under Review', 'Resolved']

const DisputeResolutionView = ({ searchQuery: externalSearchQuery }) => {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All Cases')
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [resolveModalItem, setResolveModalItem] = useState(null)

  const searchQuery = externalSearchQuery ?? ''

  const loadDisputes = async () => {
    try {
      setLoading(true)
      const data = await getAdminDisputes()
      setDisputes(data)
      if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].id)
      }
    } catch (err) {
      console.error('[DisputeResolutionView] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDisputes()
  }, [])

  const filteredCases = useMemo(() => {
    return disputes.filter((item) => {
      const isResolved = item.is_resolved || item.status?.startsWith('Resolved')
      const matchesFilter =
        activeFilter === 'All Cases' ||
        (activeFilter === 'Under Review' && !isResolved) ||
        (activeFilter === 'Resolved' && isResolved)

      const q = searchQuery.toLowerCase()
      const idStr = String(item.id || '').toLowerCase()
      const titleStr = String(item.title || item.project_title || '').toLowerCase()
      const clientStr = String(item.client_name || item.creator_name || '').toLowerCase()
      const expertStr = String(item.expert_name || item.target_name || '').toLowerCase()

      const matchesSearch =
        idStr.includes(q) ||
        titleStr.includes(q) ||
        clientStr.includes(q) ||
        expertStr.includes(q)

      return matchesFilter && matchesSearch
    })
  }, [disputes, activeFilter, searchQuery])

  const selectedDispute = useMemo(() => {
    return disputes.find(d => d.id === selectedCaseId) || disputes[0] || null
  }, [disputes, selectedCaseId])

  const stats = useMemo(() => {
    const activeCount = disputes.filter(d => !d.is_resolved).length
    const reviewCount = disputes.filter(d => !d.is_resolved && d.status === 'Under Review').length
    const resolvedCount = disputes.filter(d => d.is_resolved).length
    const totalVal = disputes.reduce((sum, d) => sum + parseFloat(d.project_total_amount || 0), 0)

    return [
      { label: 'Active Disputes', value: String(activeCount), note: `${activeCount} pending admin review`, tone: 'is-info' },
      { label: 'Under Review', value: String(reviewCount), note: 'Escrow frozen' },
      { label: 'Resolved Cases', value: String(resolvedCount), note: 'Payouts processed', tone: 'is-success' },
      { label: 'Total Value', value: `$${totalVal.toLocaleString()}`, note: 'Disputed project volume', tone: 'is-danger' },
    ]
  }, [disputes])

  const handleResolveSubmit = async (disputeId, resolutionData) => {
    await resolveAdminDispute(disputeId, resolutionData)
    await loadDisputes()
  }

  return (
    <>
      <DisputeResolutionStats stats={stats} />

      <section className="dispute-workspace">
        <div className="dispute-cases-column">
          <DisputeCaseFilters
            activeFilter={activeFilter}
            filters={disputeFilters}
            onFilterChange={setActiveFilter}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
              Loading dispute cases from backend...
            </div>
          ) : (
            <DisputeCaseList
              cases={filteredCases}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
              onResolveCase={(item) => setResolveModalItem(item)}
            />
          )}
        </div>

        <div className="dispute-side-column">
          <EvidencePreviewPanel dispute={selectedDispute} />
          <ChatSummaryPanel dispute={selectedDispute} />
        </div>
      </section>

      {resolveModalItem && (
        <DisputeResolutionModal
          dispute={resolveModalItem}
          onClose={() => setResolveModalItem(null)}
          onResolved={handleResolveSubmit}
        />
      )}
    </>
  )
}

export default DisputeResolutionView
