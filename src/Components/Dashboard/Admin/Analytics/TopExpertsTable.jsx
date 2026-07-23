import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const pageSize = 20

const ExpertAvatar = ({ expert }) => (
  expert.avatar ? (
    <img src={expert.avatar} alt={expert.name} />
  ) : (
    <span className="analytics-expert-avatar-fallback">
      {expert.name.trim().charAt(0).toUpperCase() || 'E'}
    </span>
  )
)

const ExpertRows = ({ experts = [], showRank = false }) => (
  <>
    {experts.map((expert) => (
      <tr key={expert.id}>
        {showRank && <td className="analytics-rank-cell">#{expert.rank}</td>}
        <td>
          <div className="analytics-expert-cell">
            <ExpertAvatar expert={expert} />
            <strong>{expert.name}</strong>
          </div>
        </td>
        <td>{expert.specialization}</td>
        <td>{expert.completion}</td>
        <td className="analytics-revenue-cell">{expert.revenue}</td>
        <td>
          <span className="analytics-status-pill">{expert.status}</span>
        </td>
      </tr>
    ))}
  </>
)

const TopExpertsTable = ({ experts = [], allExperts = [] }) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [rankingFilter, setRankingFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredExperts = rankingFilter === 'top5'
    ? allExperts.slice(0, 5)
    : rankingFilter === 'top10'
      ? allExperts.slice(0, 10)
      : allExperts
  const totalPages = Math.max(1, Math.ceil(filteredExperts.length / pageSize))
  const effectivePage = Math.min(currentPage, totalPages)
  const pageStart = (effectivePage - 1) * pageSize
  const paginatedExperts = filteredExperts.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    if (!isLeaderboardOpen) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsLeaderboardOpen(false)
    }

    document.body.classList.add('analytics-leaderboard-open')
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.classList.remove('analytics-leaderboard-open')
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isLeaderboardOpen])

  const selectRankingFilter = (filter) => {
    setRankingFilter(filter)
    setCurrentPage(1)
  }

  return (
    <>
      <section className="analytics-experts-section">
        <div className="analytics-experts-heading">
          <h2>Top 5 Performing AI Experts</h2>
          <button
            type="button"
            onClick={() => {
              setRankingFilter('all')
              setCurrentPage(1)
              setIsLeaderboardOpen(true)
            }}
          >
            View Full Leaderboard
          </button>
        </div>

        <div className="analytics-experts-table-wrap">
          <table className="analytics-experts-table">
            <thead>
              <tr>
                <th>Expert</th>
                <th>Specialization</th>
                <th>Completion</th>
                <th>Total Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <ExpertRows experts={experts} />
            </tbody>
          </table>
        </div>
      </section>

      {isLeaderboardOpen && (
        <div
          className="analytics-leaderboard-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLeaderboardOpen(false)
          }}
        >
          <section
            className="analytics-leaderboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="analytics-leaderboard-title"
          >
            <header className="analytics-leaderboard-header">
              <div>
                <h2 id="analytics-leaderboard-title">AI Expert Leaderboard</h2>
                <p>Experts ranked by revenue, completed projects, and rating.</p>
              </div>
              <button
                type="button"
                className="analytics-leaderboard-close"
                aria-label="Close leaderboard"
                onClick={() => setIsLeaderboardOpen(false)}
              >
                <X size={20} />
              </button>
            </header>

            <div className="analytics-leaderboard-filters" aria-label="Leaderboard range">
              {[
                { value: 'top5', label: 'Top 5' },
                { value: 'top10', label: 'Top 10' },
                { value: 'all', label: 'All Experts' },
              ].map((filter) => (
                <button
                  type="button"
                  className={rankingFilter === filter.value ? 'active' : ''}
                  key={filter.value}
                  onClick={() => selectRankingFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="analytics-experts-table-wrap analytics-leaderboard-table-wrap">
              <table className="analytics-experts-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Expert</th>
                    <th>Specialization</th>
                    <th>Completion</th>
                    <th>Total Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <ExpertRows experts={paginatedExperts} showRank />
                  {paginatedExperts.length === 0 && (
                    <tr>
                      <td className="analytics-leaderboard-empty" colSpan="6">
                        No experts found for this year.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="analytics-leaderboard-footer">
              <span>
                Showing {filteredExperts.length ? pageStart + 1 : 0}-
                {Math.min(pageStart + pageSize, filteredExperts.length)} of {filteredExperts.length}
              </span>
              <div className="analytics-leaderboard-pagination">
                <button
                  type="button"
                  aria-label="Previous leaderboard page"
                  disabled={effectivePage === 1}
                  onClick={() => setCurrentPage(effectivePage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    type="button"
                    className={page === effectivePage ? 'active' : ''}
                    aria-current={page === effectivePage ? 'page' : undefined}
                    key={page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next leaderboard page"
                  disabled={effectivePage === totalPages}
                  onClick={() => setCurrentPage(effectivePage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}

export default TopExpertsTable
