import { useMemo, useState, useEffect } from 'react'
import ContentModerationFilters from './ContentModerationFilters'
import ContentModerationPagination from './ContentModerationPagination'
import ContentModerationStats from './ContentModerationStats'
import { moderationFilters, moderationItems, moderationStats } from './contentModerationData'
import ModerationQueueList from './ModerationQueueList'

const normalizeSeverity = (value = '') =>
  value.toLowerCase().replace(' severity', '').trim()

const ContentModerationView = ({ searchQuery: externalSearchQuery, items = moderationItems, stats = moderationStats, onApprove, onReject }) => {
  const [activeFilter, setActiveFilter] = useState('All Types')
  const [severityFilter, setSeverityFilter] = useState('All Levels')
  const [currentPage, setCurrentPage] = useState(1)
  const [showReviewedOnly, setShowReviewedOnly] = useState(false)
  const searchQuery = externalSearchQuery ?? ''

  // Reset page when filters or search terms change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, severityFilter, searchQuery, showReviewedOnly])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by moderation reviewed status
      const isPending = item.status === 'pending'
      const matchesReviewed = showReviewedOnly ? !isPending : isPending
      if (!matchesReviewed) return false

      let matchesType = false
      if (activeFilter === 'All Types') {
        matchesType = true
      } else if (activeFilter === 'Job Posts' && item.category === 'Job') {
        matchesType = true
      } else if (activeFilter === 'Service Listings' && item.category === 'Service') {
        matchesType = true
      }

      const matchesSeverity =
        severityFilter === 'All Levels' ||
        normalizeSeverity(item.severityLabel || item.severity) === normalizeSeverity(severityFilter)
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesType && matchesSeverity && matchesSearch
    })
  }, [activeFilter, items, searchQuery, severityFilter, showReviewedOnly])

  const pageSize = 5
  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  return (
    <>
      <ContentModerationStats stats={stats} />
      <ContentModerationFilters
        activeFilter={activeFilter}
        filters={moderationFilters}
        onFilterChange={setActiveFilter}
        onSeverityChange={setSeverityFilter}
        severityFilter={severityFilter}
        showReviewedOnly={showReviewedOnly}
        onToggleReviewedOnly={setShowReviewedOnly}
      />
      <ModerationQueueList items={paginatedItems} onApprove={onApprove} onReject={onReject} />
      <ContentModerationPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </>
  )
}

export default ContentModerationView
