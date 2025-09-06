import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectFilters = ({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onClearFilters,
  projectCount 
}) => {
  const filterCategories = [
    {
      key: 'category',
      label: 'Project Type',
      options: filters?.categories || []
    },
    {
      key: 'industry',
      label: 'Industry',
      options: filters?.industries || []
    },
    {
      key: 'technology',
      label: 'Technology',
      options: filters?.technologies || []
    }
  ];

  const hasActiveFilters = Object.values(activeFilters)?.some(filterArray => filterArray?.length > 0);

  const handleFilterToggle = (category, value) => {
    const currentFilters = activeFilters?.[category] || [];
    const isActive = currentFilters?.includes(value);
    
    let newFilters;
    if (isActive) {
      newFilters = currentFilters?.filter(item => item !== value);
    } else {
      newFilters = [...currentFilters, value];
    }
    
    onFilterChange(category, newFilters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground font-semibold text-lg">Filter Projects</h2>
          <p className="text-text-secondary text-sm">
            Showing {projectCount} project{projectCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-accent hover:text-accent/80 text-sm font-medium transition-colors duration-150 ease-out flex items-center space-x-1"
          >
            <Icon name="X" size={14} />
            <span>Clear all</span>
          </button>
        )}
      </div>
      {/* Filter Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filterCategories?.map((category) => (
          <div key={category?.key} className="space-y-3">
            <h3 className="text-foreground font-medium text-sm">
              {category?.label}
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {category?.options?.map((option) => {
                const isActive = (activeFilters?.[category?.key] || [])?.includes(option);
                
                return (
                  <button
                    key={option}
                    onClick={() => handleFilterToggle(category?.key, option)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 ease-out ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-surface text-text-secondary hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Mobile Filter Summary */}
      <div className="md:hidden">
        {hasActiveFilters && (
          <div className="space-y-2">
            <h4 className="text-foreground font-medium text-sm">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters)?.map(([category, values]) =>
                values?.map((value) => (
                  <span
                    key={`${category}-${value}`}
                    className="inline-flex items-center space-x-1 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => handleFilterToggle(category, value)}
                      className="hover:bg-accent-foreground/20 rounded-sm p-0.5"
                    >
                      <Icon name="X" size={10} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectFilters;