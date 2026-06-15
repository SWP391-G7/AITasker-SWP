import React from 'react';
import { Search } from 'lucide-react';
import './Marketplace.css';

const MarketplaceSearch = () => {
  return (
    <div className="search-filter-container">
      <div className="search-box-card">
        <div className="search-input-wrapper">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search for AI services (e.g., 'LLM Fine-tuning', 'Object Detection')..." 
          />
          <span className="search-shortcut">⌘K</span>
        </div>
        
        <div className="filter-row">
          <div className="filter-item">
            <label className="filter-label">Category</label>
            <select className="filter-select">
              <option>All Categories</option>
              <option>NLP</option>
              <option>Computer Vision</option>
              <option>Data Engineering</option>
              <option>Generative AI</option>
              <option>MLOps</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label className="filter-label">Budget Range</label>
            <select className="filter-select">
              <option>Any Price</option>
              <option>$0 - $500</option>
              <option>$500 - $2,000</option>
              <option>$2,000+</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label className="filter-label">Delivery Time</label>
            <select className="filter-select">
              <option>Anytime</option>
              <option>Within 24 hours</option>
              <option>3 Days</option>
              <option>7 Days</option>
              <option>14+ Days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSearch;
