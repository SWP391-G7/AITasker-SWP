import { useMemo, useState } from 'react'
import ContentModerationFilters from './ContentModerationFilters'
import ContentModerationHeader from './ContentModerationHeader'
import ContentModerationPagination from './ContentModerationPagination'
import ContentModerationStats from './ContentModerationStats'
import { moderationFilters, moderationItems, moderationStats } from './contentModerationData'
import ModerationQueueList from './ModerationQueueList'

const ContentModerationView = () => {
  const [activeFilter, setActiveFilter] = useState('All Types')
  const [severityFilter, setSeverityFilter] = useState('All Levels')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    return moderationItems.filter((item) => {
      const matchesType = activeFilter === 'All Types' || item.category === activeFilter
      const matchesSeverity =
        severityFilter === 'All Levels' || item.severityLabel === severityFilter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesType && matchesSeverity && matchesSearch
    })
  }, [activeFilter, searchQuery, severityFilter])

  return (
    <>
      <ContentModerationHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ContentModerationStats stats={moderationStats} />
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
