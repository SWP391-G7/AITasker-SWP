import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { jobCategories } from './jobsData';

const JobFilters = () => {
  return (
    <aside className="job-filters-sidebar">
      <div className="filter-group">
        <h4 className="filter-title">
          <Filter size={16} />
          Filters
        </h4>
      </div>

      <div className="filter-group">
        <h5 className="group-label">Category</h5>
        <div className="category-list">
          {jobCategories.map((category, index) => (
            <label key={index} className="filter-checkbox-item">
              <input type="checkbox" />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h5 className="group-label">Budget Range</h5>
        <div className="range-inputs">
          <input type="number" placeholder="Min" className="range-input" />
          <span className="range-divider">-</span>
          <input type="number" placeholder="Max" className="range-input" />
        </div>
      </div>

      <div className="filter-group">
        <h5 className="group-label">Job Type</h5>
        <div className="type-list">
          <label className="filter-checkbox-item">
            <input type="checkbox" />
            <span>Full-time</span>
          </label>
          <label className="filter-checkbox-item">
            <input type="checkbox" />
            <span>Contract</span>
          </label>
          <label className="filter-checkbox-item">
            <input type="checkbox" />
            <span>Freelance</span>
          </label>
        </div>
      </div>

      <button className="reset-filters-btn">Clear All Filters</button>
    </aside>
  );
};

export default JobFilters;
