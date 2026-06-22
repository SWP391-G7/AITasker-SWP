import { useState, useMemo, useEffect } from 'react';
import { Grid, List, Search as SearchIcon, Loader2, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { allServices as mockServices } from './servicesData';
import { getMarketplaceJobs, getMarketplaceServices } from '../../Services/serviceService';
import '../../pages/DashboardPage/Client/ExpertSearchPage.css';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [budget, setBudget] = useState('Any Price');
  const [deliveryTime, setDeliveryTime] = useState('Anytime');
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;
  const role = getCurrentRole();
  const isExpert = role === 'expert';

  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      try {
        setLoading(true);
        const services = await getMarketplaceServices();
        setMarketplaceItems(services.map(formatService));
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setMarketplaceItems([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchClientTasks = async () => {
      try {
        setLoading(true);
        const jobs = await getMarketplaceJobs();
        setMarketplaceItems(jobs.map(formatJob));
      } catch (err) {
        console.error('Failed to fetch client tasks:', err);
        setMarketplaceItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (isExpert) {
      fetchClientTasks();
      return;
    }

    fetchMarketplaceItems();
  }, [isExpert]);

  const combinedItems = useMemo(() => {
    if (isExpert) return marketplaceItems;

    const mockWithIds = mockServices.map((s, idx) => ({
      ...s,
      id: `mock-${idx}`,
      type: 'service',
      budgetValue: parseMoney(s.price),
      description: '',
    }));

    return [...marketplaceItems, ...mockWithIds];
  }, [isExpert, marketplaceItems]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const keyword = searchQuery.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(keyword) ||
        item.expert.toLowerCase().includes(keyword) ||
        (item.description || '').toLowerCase().includes(keyword);

      const matchesCategory =
        category === 'All Categories' ||
        item.tag.toUpperCase().includes(category.toUpperCase());

      let matchesBudget = true;

      if (budget === '$0 - $500') {
        const price = item.budgetValue || parseMoney(item.price);
        matchesBudget = price <= 500;
      } else if (budget === '$500 - $2,000') {
        const price = item.budgetValue || parseMoney(item.price);
        matchesBudget = price > 500 && price <= 2000;
      } else if (budget === '$2,000+') {
        const price = item.budgetValue || parseMoney(item.price);
        matchesBudget = price > 2000;
      }

      return matchesSearch && matchesCategory && matchesBudget;
    });
  }, [searchQuery, category, budget, combinedItems]);

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

            <button
              className="advanced-filter-btn"
              type="button"
            >
              <SlidersHorizontal size={22} />
              Apply Filters
            </button>
          </section>

          <div className="expert-search-box">
            <SearchIcon size={22} />
            <input
              type="text"
              placeholder={isExpert ? 'Search client tasks...' : 'Search services...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <span>Enter</span>
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