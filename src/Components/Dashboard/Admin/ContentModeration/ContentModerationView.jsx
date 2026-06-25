import { useMemo, useState } from 'react'
import ContentModerationFilters from './ContentModerationFilters'
import ContentModerationPagination from './ContentModerationPagination'
import ContentModerationStats from './ContentModerationStats'
import { moderationFilters, moderationItems, moderationStats } from './contentModerationData'
import ModerationQueueList from './ModerationQueueList'

const ContentModerationView = ({ searchQuery: externalSearchQuery, items = moderationItems, stats = moderationStats }) => {
  const [activeFilter, setActiveFilter] = useState('All Types')
  const [severityFilter, setSeverityFilter] = useState('All Levels')
  const searchQuery = externalSearchQuery ?? ''

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = activeFilter === 'All Types' || item.category === activeFilter
      const matchesSeverity =
        severityFilter === 'All Levels' || item.severityLabel === severityFilter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesType && matchesSeverity && matchesSearch
    })
  }, [activeFilter, items, searchQuery, severityFilter])

  return (
    <>
      <ContentModerationStats stats={stats} />
      <ContentModerationFilters
        activeFilter={activeFilter}
        filters={moderationFilters}
        onFilterChange={setActiveFilter}
        onSeverityChange={setSeverityFilter}
        severityFilter={severityFilter}
      />
      <ModerationQueueList items={filteredItems} />
      <ContentModerationPagination />
    </>
  )
}

export default ContentModerationView
