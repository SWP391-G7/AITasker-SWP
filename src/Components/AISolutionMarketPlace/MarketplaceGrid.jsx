import { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { search as searchApi } from '../../Services/searchService';
import { getFavorites, addFavorite, removeFavorite } from '../../Services/favoriteService';
import { useLocation } from 'react-router-dom';
import '../../pages/clients-experts/ClientExpertSearchPage.css';
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

  if (min && max && min !== max) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (min && max) return formatMoney(min);
  if (max) return `Up to ${formatMoney(max)}`;
  if (min) return `From ${formatMoney(min)}`;
  return 'Budget TBD';
};

const formatService = (service) => ({
  id: service.id,
  type: 'service',
  tag: (service.tags || 'AI').toUpperCase(),
  expert: service.expert_name || 'AI Expert',
  rating: service.avg_rating?.toString() || '',
  title: service.title || 'AI Service',
  price: 'From ' + formatMoney(service.price) + (service.pricing_type === 'hourly' ? '/hr' : ''),
  rawPrice: parseMoney(service.price),
  image: parseJobImage(service.images) || service.image_url || null,
  description: service.description || '',
  deliveryDays: service.delivery_days || 0,
});

const parseJobImage = (images) => {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
  } catch {
    return typeof images === 'string' ? images : null;
  }
};

const formatJob = (job) => ({
  id: job.id,
  type: 'job',
  tag: (job.required_skill || job.tags || 'CLIENT TASK').toUpperCase(),
  expert: job.client_name || job.company_name || 'Client',
  rating: job.duration_days ? `${job.duration_days} days` : 'Open',
  title: job.title || 'Untitled client task',
  price: formatBudget(job),
  budgetValue: parseMoney(job.budget_max) || parseMoney(job.budget_min),
  image: parseJobImage(job.images),
  description: job.description || 'No task description provided yet.',
  status: job.status,
});

const MarketplaceGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [techStackDraft, setTechStackDraft] = useState('');
  const [techStackFilter, setTechStackFilter] = useState('');
  const [budget, setBudget] = useState('Any Price');
  const [deliveryTime, setDeliveryTime] = useState('Anytime');
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('marketplaceViewMode') || getCurrentRole();
  });
  const [showClosed, setShowClosed] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(getFavorites('services')));
  const itemsPerPage = 9;
  const isExpert = viewMode === 'expert';

  useEffect(() => {
    setFavoriteIds(new Set(getFavorites(isExpert ? 'jobs' : 'services')));
  }, [isExpert]);

  const toggleFavorite = (id) => {
    const targetKey = isExpert ? 'jobs' : 'services';
    if (favoriteIds.has(id)) {
      removeFavorite(targetKey, id);
      setFavoriteIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      addFavorite(targetKey, id);
      setFavoriteIds((prev) => new Set(prev).add(id));
    }
  };

  useEffect(() => {
    localStorage.setItem('marketplaceViewMode', viewMode);
  }, [viewMode]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('query') || '';
    const urlTarget = params.get('target');

    setSearchDraft(urlQuery);
    setSearchQuery(urlQuery);

    if (urlTarget) {
      if (urlTarget === 'jobs') {
        setViewMode('expert');
      } else if (urlTarget === 'services') {
        setViewMode('client');
      }
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const searchParams = {
          target: isExpert ? 'jobs' : 'services',
          query: searchQuery.trim(),
        };

        if (isExpert) {
          searchParams.includeClosed = showClosed;
        }

        // Tech Stack filter
        if (techStackFilter) {
          if (isExpert) {
            searchParams.requiredSkill = techStackFilter;
          } else {
            searchParams.tags = techStackFilter;
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

        // Delivery time filter (backend only supports duration for jobs)
        if (isExpert && deliveryTime !== 'Anytime') {
          let days = 999;
          if (deliveryTime === 'Within 24 hours') days = 1;
          else if (deliveryTime === '3 Days') days = 3;
          else if (deliveryTime === '7 Days') days = 7;
          searchParams.duration = days;
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
  }, [isExpert, searchQuery, techStackFilter, budget, deliveryTime, showClosed]);

  const filteredItems = useMemo(() => {
    let result = marketplaceItems;

    // Client-side delivery time filter for services
    if (!isExpert && deliveryTime !== 'Anytime') {
      let maxDays = 999;
      if (deliveryTime === 'Within 24 hours') maxDays = 1;
      else if (deliveryTime === '3 Days') maxDays = 3;
      else if (deliveryTime === '7 Days') maxDays = 7;
      result = result.filter((item) => {
        const days = item.deliveryDays || 999;
        return days <= maxDays;
      });
    }

    // Sort
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === "price-low") {
      result = [...result].sort((a, b) => (a.rawPrice || a.budgetValue) - (b.rawPrice || b.budgetValue));
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => (b.rawPrice || b.budgetValue) - (a.rawPrice || a.budgetValue));
    }

    return result;
  }, [marketplaceItems, isExpert, deliveryTime, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <h3>Tech Stack</h3>
                <div className="tech-stack-filter-input">
                  <input
                    type="text"
                    placeholder={isExpert ? 'e.g., Python, NLP, LLM...' : 'e.g., Python, Computer Vision...'}
                    value={techStackDraft}
                    onChange={(e) => setTechStackDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setTechStackFilter(techStackDraft);
                        setCurrentPage(1);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="tech-stack-apply-btn"
                    onClick={() => {
                      setTechStackFilter(techStackDraft);
                      setCurrentPage(1);
                    }}
                  >
                    Apply
                  </button>
                  {techStackFilter && (
                    <button
                      type="button"
                      className="tech-stack-clear-btn"
                      onClick={() => {
                        setTechStackDraft('');
                        setTechStackFilter('');
                        setCurrentPage(1);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-group">
                <h3>Budget Range</h3>
                <div className="filter-tags">
                  {["Any Price", "$0 - $500", "$500 - $2,000", "$2,000+"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={budget === opt ? "active" : ""}
                      onClick={() => {
                        setBudget(opt);
                        setCurrentPage(1);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Delivery Time</h3>
                <div className="filter-tags">
                  {["Anytime", "Within 24 hours", "3 Days", "7 Days"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={deliveryTime === opt ? "active" : ""}
                      onClick={() => {
                        setDeliveryTime(opt);
                        setCurrentPage(1);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {isExpert && (
                <div className="filter-group">
                  <h3>Status</h3>
                  <div className="filter-tags">
                    {["Open Only", "All"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={(!showClosed && opt === "Open Only") || (showClosed && opt === "All") ? "active" : ""}
                        onClick={() => {
                          setShowClosed(opt === "All");
                          setCurrentPage(1);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <section className="expert-results">
              <div className="results-header">
                <strong>
                  Showing {filteredItems.length} {isExpert ? 'client tasks' : 'services'} matching criteria
                </strong>

                <div className="sort-box">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="expert-grid">
                {currentItems.length > 0 ? (
                  currentItems.map((svc, index) => (
                    <ServiceCard key={svc.id} {...svc} isFavorited={favoriteIds.has(svc.id)} onToggleFavorite={toggleFavorite} />
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
