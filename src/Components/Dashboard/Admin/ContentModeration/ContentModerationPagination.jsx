import { ChevronLeft, ChevronRight } from 'lucide-react'

const ContentModerationPagination = () => (
  <div className="moderation-pagination-row">
    <span>Showing 1-10 of 142 items</span>
    <div className="moderation-pagination">
      <button className="moderation-page-button" type="button" aria-label="Previous page">
        <ChevronLeft size={14} />
      </button>
      <button className="moderation-page-button active" type="button">1</button>
      <button className="moderation-page-button" type="button">2</button>
      <button className="moderation-page-button" type="button">3</button>
      <button className="moderation-page-button" type="button">...</button>
      <button className="moderation-page-button" type="button">15</button>
      <button className="moderation-page-button" type="button" aria-label="Next page">
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
)

export default ContentModerationPagination
