import React from 'react';
import ArticleCard from './ArticleCard';

const FeaturedArticles = ({ articles }) => {
  if (!articles || articles?.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-semibold text-foreground">Featured Articles</h2>
        <div className="h-px bg-border flex-1 ml-4"></div>
      </div>
      <div className="space-y-6">
        {articles?.map((article) => (
          <ArticleCard 
            key={article?.id} 
            article={article} 
            featured={true} 
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedArticles;