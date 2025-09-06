import React from 'react';
import ArticleCard from './ArticleCard';

const ArticleGrid = ({ articles, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)]?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-full"></div>
                <div className="h-5 bg-muted rounded w-3/4"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📝</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">No articles found</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles?.map((article) => (
        <ArticleCard key={article?.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleGrid;