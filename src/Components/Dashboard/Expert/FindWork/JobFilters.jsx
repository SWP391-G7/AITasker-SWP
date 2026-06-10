import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

const JobFilters = () => {
  return (
    <div className="horizontal-filter-bar">
      <div className="filter-dropdown-group">
        <div className="filter-select-wrapper">
          <label>TECH STACK</label>
          <div className="custom-select">
            <span>All Technologies</span>
            <ChevronDown size={16} />
          </div>
        </div>
        
        <div className="filter-divider"></div>
        
        <div className="filter-select-wrapper">
          <label>MIN. BUDGET</label>
          <div className="custom-select">
            <span>$500+</span>
            <ChevronDown size={16} />
          </div>
        </div>
        
        <div className="filter-divider"></div>
        
        <div className="filter-select-wrapper">
          <label>DURATION</label>
          <div className="custom-select">
            <span>Any Duration</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      
      <button className="filter-apply-btn">
        <Filter size={18} />
        Apply
      </button>
    </div>
  );
};

export default JobFilters;
