export const MODERATION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'job', label: 'Job Posts' },
  { id: 'service', label: 'Services' },
]

export const filterModerationsByType = (moderations = [], filterType = 'all') => {
  if (filterType === 'all') {
    return moderations
  }

  return moderations.filter((item) => item.sourceType === filterType)
}
