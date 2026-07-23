/**
 * Frontend module: Components/Dashboard/Admin/ContentModeration/ContentModerationView.jsx
 *
 * Vai trò: Component Content Moderation View: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useMemo, useState, useEffect } from 'react'
import ContentModerationFilters from './ContentModerationFilters'
import ContentModerationPagination from './ContentModerationPagination'
import ContentModerationStats from './ContentModerationStats'
import { moderationFilters, moderationItems, moderationStats } from './contentModerationData'
import ModerationQueueList from './ModerationQueueList'

// Chuyển đổi dữ liệu cho “normalize severity” thành định dạng mà lớp gọi hoặc giao diện cần.
const normalizeSeverity = (value = '') =>
  value.toLowerCase().replace(' severity', '').trim()

// React component “Content Moderation View” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ContentModerationView = ({
  searchQuery: externalSearchQuery,
  items = moderationItems,
  stats = moderationStats,
  onApprove,
  onReject,
  onUnpublish,
  onRepublish
}) => {
  const [activeFilter, setActiveFilter] = useState('All Types')
  const [severityFilter, setSeverityFilter] = useState('All Levels')
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all')
  const searchQuery = externalSearchQuery ?? ''

  // Reset page when filters or search terms change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, severityFilter, searchQuery, reviewStatusFilter])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by moderation reviewed status
      const isPending = String(item.status || 'pending').toLowerCase() === 'pending'
      const matchesReviewStatus =
        reviewStatusFilter === 'all' ||
        (reviewStatusFilter === 'reviewed' && !isPending) ||
        (reviewStatusFilter === 'unreviewed' && isPending)
      if (!matchesReviewStatus) return false

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
  }, [activeFilter, items, searchQuery, severityFilter, reviewStatusFilter])

  const pageSize = 5
  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const paginatedItems = useMemo(() => {
    // Thực hiện phần logic “start” trong phạm vi trách nhiệm của module hiện tại.
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
        reviewStatusFilter={reviewStatusFilter}
        onReviewStatusChange={setReviewStatusFilter}
      />
      <ModerationQueueList
        items={paginatedItems}
        onApprove={onApprove}
        onReject={onReject}
        onUnpublish={onUnpublish}
        onRepublish={onRepublish}
      />
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
