import { useState, useMemo, useEffect } from 'react';
import { Grid, List, Search as SearchIcon, Loader2, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { search as searchApi } from '../../Services/searchService';
import '../../pages/ClientExpertSearchPage.css';
import './Marketplace.css';

const getCurrentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.role || 'client';
  } catch {
    return 'client';
  }
};

const parseMoney = (value) => {
  const parsed = Number(String(value || '0').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`;

const formatBudget = (job) => {
  const min = parseMoney(job.budget_min);
  const max = parseMoney(job.budget_max);

  if (min && max) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (max) return `Up to ${formatMoney(max)}`;
  if (min) return `From ${formatMoney(min)}`;
  return 'Budget TBD';
};

const formatService = (service) => ({
  id: service.id,
  type: 'service',
  tag: service.tags?.toUpperCase() || 'AI',
  expert: service.expert_name || 'AI Expert',
  rating: service.avg_rating?.toString() || '5.0',
  title: service.title || 'AI Service',
  price: formatMoney(service.price),
  budgetValue: parseMoney(service.price),
  image: service.image_url || null,
});

const formatJob = (job) => ({
  id: job.id,
  type: 'job',
  tag: job.required_skill?.toUpperCase() || 'CLIENT TASK',
  expert: job.client_name || job.company_name || 'Client',
  rating: job.duration_days ? `${job.duration_days} days` : 'Open task',
  title: job.title || 'Untitled client task',
  price: formatBudget(job),
  budgetValue: parseMoney(job.budget_max) || parseMoney(job.budget_min),
  image: null,
  description: job.description || 'No task description provided yet.',
});

const MarketplaceGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [budget, setBudget] = useState('Any Price');
  const [deliveryTime, setDeliveryTime] = useState('Anytime');
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(getCurrentRole());
  const itemsPerPage = 9;
  const isExpert = viewMode === 'expert';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const searchParams = {
          target: isExpert ? 'jobs' : 'services',
          query: searchQuery.trim(),
        };

        // Category filter
        if (category !== 'All Categories') {
          if (isExpert) {
            searchParams.requiredSkill = category;
          } else {
            searchParams.tags = category;
          }
        }

        // Budget filter mapping
        if (budget === '$0 - $500') {
          if (isExpert) {
            searchParams.budgetMin = 0;
            searchParams.budgetMax = 500;
          } else {
            searchParams.priceMin = 0;
            searchParams.priceMax = 500;
          }
        } else if (budget === '$500 - $2,000') {
          if (isExpert) {
            searchParams.budgetMin = 500;
            searchParams.budgetMax = 2000;
          } else {
            searchParams.priceMin = 500;
            searchParams.priceMax = 2000;
          }
        } else if (budget === '$2,000+') {
          if (isExpert) {
            searchParams.budgetMin = 2000;
          } else {
            searchParams.priceMin = 2000;
          }
        }

        // Delivery time filter mapping
        if (deliveryTime !== 'Anytime') {
          let days = 999;
          if (deliveryTime === 'Within 24 hours') days = 1;
          else if (deliveryTime === '3 Days') days = 3;
          else if (deliveryTime === '7 Days') days = 7;

          if (isExpert) {
            searchParams.duration = days;
          } else {
            searchParams.deliveryDays = days;
          }
        }

        const response = await searchApi(searchParams);
        const results = response.results || [];
        setMarketplaceItems(results.map(isExpert ? formatJob : formatService));
      } catch (err) {
        console.error('Failed to fetch marketplace items:', err);
        setMarketplaceItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isExpert, searchQuery, category, budget, deliveryTime]);

  const filteredItems = useMemo(() => {
    return marketplaceItems;
  }, [marketplaceItems]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '400px' }}>
        <Loader2 className="animate-spin text-primary mb-3" size={48} />
        <p className="text-muted">
          {isExpert ? 'Loading client tasks...' : 'Loading AI Marketplace...'}
        </p>
      </div>
    );
  }

  return (
    <div className="expert-search-page">
      <main className="expert-search-page">
        <section className="expert-main">
          <section className="expert-hero">
            <div>
              <h2>
                {isExpert ? 'Browse Client ' : 'Explore the '}
                <span style={{
                  background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{isExpert ? 'AI Tasks' : 'AI Solutions'}</span>
              </h2>
              <p>
                {isExpert
                  ? 'Find client projects that need AI expertise, review the task scope, and choose work that matches your skills.'
                  : 'Discover high-performance AI services from vetted experts to accelerate your product development and automate complex workflows.'}
              </p>
            </div>

          </section>

          <div className="expert-search-row">
            <div className="expert-search-box">
              <SearchIcon size={22} style={{ cursor: 'pointer' }} onClick={() => {
                setSearchQuery(searchDraft);
                setCurrentPage(1);
              }} />
              <input
                type="text"
                placeholder={isExpert ? 'Search client tasks...' : 'Search services...'}
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchDraft);
                    setCurrentPage(1);
                  }
                }}
              />
              <span style={{ cursor: 'pointer' }} onClick={() => {
                setSearchQuery(searchDraft);
                setCurrentPage(1);
              }}>Enter</span>
            </div>

            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${!isExpert ? "active" : ""}`}
                onClick={() => setViewMode("client")}
              >
                AI Solutions
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${isExpert ? "active" : ""}`}
                onClick={() => setViewMode("expert")}
              >
                Client Tasks
              </button>
            </div>
          </div>

          <section className="expert-content">
            <aside className="expert-filters">
              <div className="filter-group">
                <h3>Category</h3>
                <div className="filter-tags">
                  {['All Categories', ...(isExpert ? ['AI', 'NLP', 'Computer Vision', 'Automation', 'Data'] : ['NLP', 'VISION', 'DATA', 'GEN AI', 'MLOPS'])].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      className={category === cat ? "active" : ""}
                      onClick={() => {
                        setCategory(cat);
                        setCurrentPage(1);
                      }}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Budget Range</h3>
                {[
                  ['Any Price', 'Any Price'],
                  ['$0 - $500', '$0 - $500'],
                  ['$500 - $2,000', '$500 - $2,000'],
                  ['$2,000+', '$2,000+']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`availability-btn ${budget === value ? "active" : ""}`}
                    onClick={() => {
                      setBudget(value);
                      setCurrentPage(1);
                    }}
                  >
                    {label}
                    <span></span>
                  </button>
                ))}
              </div>

              <div className="filter-group">
                <h3>Delivery Time</h3>
                {[
                  ['Anytime', 'Anytime'],
                  ['Within 24 hours', 'Within 24 hours'],
                  ['3 Days', '3 Days'],
                  ['7 Days', '7 Days']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`availability-btn ${deliveryTime === value ? "active" : ""}`}
                    onClick={() => setDeliveryTime(value)}
                  >
                    {label}
                    <span></span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="expert-results">
              <div className="results-header">
                <strong>
                  Showing {filteredItems.length} {isExpert ? 'client tasks' : 'services'} matching criteria
                </strong>

                <div className="sort-box">
                  <span>Sort by:</span>
                  <select>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown size={18} />
                </div>
              </div>

              <div className="expert-grid">
                {currentItems.length > 0 ? (
                  currentItems.map((svc, index) => (
                    <ServiceCard key={index} {...svc} />
                  ))
                ) : (
                  <div className="no-expert-result">
                    No results found. Try changing filters.
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft size={22} />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={currentPage === item ? "active" : ""}
                      onClick={() => handlePageChange(item)}
                    >
                      {item}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              )}
            </section>
          </section>
        </section>
      </main>
    </div>
  );
};

export default MarketplaceGrid;