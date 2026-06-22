import React, { useState, useMemo, useEffect } from 'react';
import { Grid, List, Search as SearchIcon, Loader2 } from 'lucide-react';
import ServiceCard from './ServiceCard';
import MarketplacePagination from './MarketplacePagination';
import { allServices as mockServices } from './servicesData';
import { getMarketplaceServices } from '../../Services/serviceService';
import './Marketplace.css';

const MarketplaceGrid = () => {
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [budget, setBudget] = useState('Any Price');
  const [realServices, setRealServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;

  // Fetch real services from DB
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await getMarketplaceServices();
        // Transform backend data to match UI expectations
        const formatted = services.map(s => ({
          id: s.id,
          tag: s.tags?.toUpperCase() || "AI",
          expert: s.expert_name,
          rating: s.avg_rating?.toString() || "5.0",
          title: s.title,
          price: `$${parseFloat(s.price).toLocaleString()}`,
          image: null // Real image logic would go here
        }));
        setRealServices(formatted);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Combine Mock and Real data (Real data first)
  const combinedServices = useMemo(() => {
    const mockWithIds = mockServices.map((s, idx) => ({
      ...s,
      id: `mock-${idx}`
    }));
    return [...realServices, ...mockWithIds];
  }, [realServices]);

  // Filter Logic
  const filteredServices = useMemo(() => {
    return combinedServices.filter(svc => {
      const matchesSearch = svc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           svc.expert.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === 'All Categories' || svc.tag.toUpperCase() === category.toUpperCase();
      
      let matchesBudget = true;
      if (budget === '$0 - $500') {
        const price = parseInt(svc.price.replace('$', '').replace(',', ''));
        matchesBudget = price <= 500;
      } else if (budget === '$500 - $2,000') {
        const price = parseInt(svc.price.replace('$', '').replace(',', ''));
        matchesBudget = price > 500 && price <= 2000;
      } else if (budget === '$2,000+') {
        const price = parseInt(svc.price.replace('$', '').replace(',', ''));
        matchesBudget = price > 2000;
      }

      return matchesSearch && matchesCategory && matchesBudget;
    });
  }, [searchQuery, category, budget, combinedServices]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '400px' }}>
        <Loader2 className="animate-spin text-primary mb-3" size={48} />
        <p className="text-muted">Loading AI Marketplace...</p>
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
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select 
              className="filter-select" 
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
            >
              <option>All Categories</option>
              <option>NLP</option>
              <option>VISION</option>
              <option>DATA</option>
              <option>GEN AI</option>
              <option>MLOPS</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Budget Range</label>
            <select 
              className="filter-select"
              value={budget}
              onChange={(e) => { setBudget(e.target.value); setCurrentPage(1); }}
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
            <h2 className="section-title">Recommended Services</h2>
            <span className="results-count">Showing {filteredServices.length} results for your criteria</span>
          </div>
          <div className="view-toggles">
            <button className={`toggle-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
              <Grid size={18} />
            </button>
            <button className={`toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="service-grid">
          {currentServices.length > 0 ? (
            currentServices.map((svc, index) => (
              <ServiceCard key={index} {...svc} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <SearchIcon size={48} />
              </div>
              <h3>No services found</h3>
              <p>Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                className="view-all-link mt-4" 
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => { setSearchQuery(''); setCategory('All Categories'); setBudget('Any Price'); }}
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
