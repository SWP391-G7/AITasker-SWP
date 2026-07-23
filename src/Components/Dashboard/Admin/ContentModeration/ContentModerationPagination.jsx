/**
 * Frontend module: Components/Dashboard/Admin/ContentModeration/ContentModerationPagination.jsx
 *
 * Vai trò: Component Content Moderation Pagination: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react'

// React component “Content Moderation Pagination” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ContentModerationPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 10
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Handler “handle prev” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1)
    }
  }

  // Handler “handle next” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
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
