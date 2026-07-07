import { ChevronLeft, ChevronRight } from 'lucide-react'

const ContentModerationPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 10
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1)
    }
  }

  // Generate page numbers
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="moderation-pagination-row">
      <span>Showing {startItem}-{endItem} of {totalItems} items</span>
      {totalPages > 1 && (
        <div className="moderation-pagination">
          <button 
            className="moderation-page-button" 
            type="button" 
            aria-label="Previous page"
            onClick={handlePrev}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={14} />
          </button>
          {pages.map((p) => (
            <button 
              key={p}
              className={`moderation-page-button ${currentPage === p ? 'active' : ''}`} 
              type="button"
              onClick={() => onPageChange && onPageChange(p)}
              style={{ cursor: 'pointer' }}
            >
              {p}
            </button>
          ))}
          <button 
            className="moderation-page-button" 
            type="button" 
            aria-label="Next page"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ContentModerationPagination
