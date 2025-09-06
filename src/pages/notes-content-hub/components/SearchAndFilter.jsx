import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SearchAndFilter = ({ onSearch, onFilterChange, activeFilters = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Topics', count: 24 },
    { id: 'systems-design', label: 'Systems Design', count: 8 },
    { id: 'leadership', label: 'Leadership', count: 6 },
    { id: 'startup-strategy', label: 'Startup Strategy', count: 5 },
    { id: 'product-management', label: 'Product Management', count: 3 },
    { id: 'industry-trends', label: 'Industry Trends', count: 2 }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterClick = (categoryId) => {
    onFilterChange(categoryId);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
          />
          <Input
            type="search"
            placeholder="Search articles by title, content, or tags..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors duration-150 ease-out"
              aria-label="Clear search"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-secondary font-medium">Filter by topic:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFilter}
            iconName={isFilterOpen ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            className="text-text-secondary hover:text-foreground md:hidden"
          >
            Categories
          </Button>
        </div>
        
        {activeFilters?.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange('all')}
            className="text-text-secondary hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>
      {/* Category Filters */}
      <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => {
            const isActive = activeFilters?.includes(category?.id) || (activeFilters?.length === 0 && category?.id === 'all');
            
            return (
              <button
                key={category?.id}
                onClick={() => handleFilterClick(category?.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-out ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {category?.label}
                <span className="ml-1 text-xs opacity-75">({category?.count})</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Active Search/Filter Indicators */}
      {(searchQuery || activeFilters?.length > 0) && (
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Filter" size={16} />
          <span>
            {searchQuery && `Searching for "${searchQuery}"`}
            {searchQuery && activeFilters?.length > 0 && ' • '}
            {activeFilters?.length > 0 && `Filtered by ${activeFilters?.join(', ')}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;