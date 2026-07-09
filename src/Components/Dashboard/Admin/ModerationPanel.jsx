import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, FileText, Search, SlidersHorizontal, Wrench } from 'lucide-react'
import { MODERATION_FILTERS, filterModerationsByType } from './moderationFilters'

const ITEMS_PER_PAGE = 5

const getFilterIcon = (filterId) => {
  if (filterId === 'job') return <BriefcaseBusiness size={14} />
  if (filterId === 'service') return <Wrench size={14} />
  return <SlidersHorizontal size={14} />
}

const ModerationPanel = ({ moderations, onApprove, onReject }) => {
  const [moderationFilter, setModerationFilter] = useState('all')
  const [moderationSearch, setModerationSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const visibleModerations = useMemo(
    () => {
      const filteredByType = filterModerationsByType(moderations, moderationFilter)
      const normalizedSearch = moderationSearch.trim().toLowerCase()

      if (!normalizedSearch) {
        return filteredByType
      }

      return filteredByType.filter((item) =>
        item.target.toLowerCase().includes(normalizedSearch) ||
        item.reason.toLowerCase().includes(normalizedSearch)
      )
    },
    [moderations, moderationFilter, moderationSearch]
  )
  const totalPages = Math.max(1, Math.ceil(visibleModerations.length / ITEMS_PER_PAGE))
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedModerations = visibleModerations.slice(pageStart, pageStart + ITEMS_PER_PAGE)
  const firstVisibleItem = visibleModerations.length === 0 ? 0 : pageStart + 1
  const lastVisibleItem = Math.min(pageStart + ITEMS_PER_PAGE, visibleModerations.length)

  useEffect(() => {
    setCurrentPage(1)
  }, [moderationFilter, moderationSearch])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleFilterChange = (filterId) => {
    setModerationFilter(filterId)
  }

  const handleSearchChange = (event) => {
    setModerationSearch(event.target.value)
  }

  return (
    <div className="admin-panel-card">
      <div className="panel-header">
        <h2 className="panel-title">Pending Moderation</h2>
        <div className="moderation-panel-search">
          <Search size={14} />
          <input
            type="search"
            value={moderationSearch}
            onChange={handleSearchChange}
            placeholder="Search moderation"
            aria-label="Search moderation items"
          />
        </div>
      </div>

      <div className="moderation-filter-tabs" aria-label="Filter moderation items">
        {MODERATION_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`moderation-type-filter ${moderationFilter === filter.id ? 'active' : ''}`}
            onClick={() => handleFilterChange(filter.id)}
          >
            {getFilterIcon(filter.id)}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="panel-list">
        {paginatedModerations.length > 0 ? (
          paginatedModerations.map((item) => (
            <div key={item.id} className="list-item-row">
              <div className="item-left">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.target} className="item-avatar" />
                ) : (
                  <div className="item-icon-box">
                    <FileText size={18} />
                  </div>
                )}
                <div className="item-details">
                  <span className="item-name">{item.target}</span>
                  <span className="item-reason">
                    Reason: <span className="reason-highlight">{item.reason}</span>
                  </span>
                </div>
              </div>
              <div className="item-actions">
                <button className="btn-reject" onClick={() => onReject(item.id)}>Reject</button>
                <button className="btn-approve" onClick={() => onApprove(item.id)}>Approve</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted small">No items pending moderation</div>
        )}
      </div>

      {visibleModerations.length > ITEMS_PER_PAGE && (
        <div className="moderation-pagination">
          <span className="moderation-page-summary">
            Showing {firstVisibleItem}-{lastVisibleItem} of {visibleModerations.length}
          </span>
          <div className="moderation-page-controls">
            <button
              type="button"
              className="moderation-page-button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label="Previous moderation page"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="moderation-page-number">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="moderation-page-button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              aria-label="Next moderation page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModerationPanel
