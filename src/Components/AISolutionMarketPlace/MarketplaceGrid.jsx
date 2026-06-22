import { useState, useMemo, useEffect } from 'react';
import { Grid, List, Search as SearchIcon, Loader2 } from 'lucide-react';
import ServiceCard from './ServiceCard';
import MarketplacePagination from './MarketplacePagination';
import { allServices as mockServices } from './servicesData';
import { getMarketplaceJobs, getMarketplaceServices } from '../../Services/serviceService';
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
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [budget, setBudget] = useState('Any Price');
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
    <div className="marketplace-layout-container">
      <aside className="marketplace-sidebar">
        <div className="sidebar-filter-section">
          <h3 className="sidebar-title">Filters</h3>

          <div className="search-input-wrapper">
            <SearchIcon size={16} className="search-icon-styled" />
            <input
              type="text"
              placeholder={isExpert ? 'Search client tasks...' : 'Search services...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Categories</option>
              {isExpert ? (
                <>
                  <option>AI</option>
                  <option>NLP</option>
                  <option>Computer Vision</option>
                  <option>Automation</option>
                  <option>Data</option>
                </>
              ) : (
                <>
                  <option>NLP</option>
                  <option>VISION</option>
                  <option>DATA</option>
                  <option>GEN AI</option>
                  <option>MLOPS</option>
                </>
              )}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Budget Range</label>
            <select
              className="filter-select"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>Any Price</option>
              <option>$0 - $500</option>
              <option>$500 - $2,000</option>
              <option>$2,000+</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Delivery Time</label>
            <select className="filter-select">
              <option>Anytime</option>
              <option>Within 24 hours</option>
              <option>3 Days</option>
              <option>7 Days</option>
            </select>
          </div>
        </div>
      </aside>

      <main className="marketplace-main-content">
        <div className="content-header">
          <div>
            <h2 className="section-title">
              {isExpert ? 'Client Tasks' : 'Recommended Services'}
            </h2>
            <span className="results-count">
              Showing {filteredItems.length} {isExpert ? 'client tasks' : 'services'} for your criteria
            </span>
          </div>

          <div className="view-toggles">
            <button
              className={`toggle-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="service-grid">
          {currentItems.length > 0 ? (
            currentItems.map((svc, index) => (
              <ServiceCard key={index} {...svc} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <SearchIcon size={48} />
              </div>
              <h3>{isExpert ? 'No client tasks found' : 'No services found'}</h3>
              <p>Try adjusting your filters or search terms to find what you're looking for.</p>
              <button
                className="view-all-link mt-4"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSearchQuery('');
                  setCategory('All Categories');
                  setBudget('Any Price');
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <MarketplacePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
};

export default MarketplaceGrid;