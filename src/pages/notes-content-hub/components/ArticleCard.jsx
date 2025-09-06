import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ArticleCard = ({ article, featured = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(' ')?.length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (featured) {
    return (
      <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ease-out group">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full overflow-hidden">
            <Image
              src={article?.featuredImage}
              alt={article?.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full">
                Featured
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <time dateTime={article?.publishedAt}>
                  {formatDate(article?.publishedAt)}
                </time>
                <span>•</span>
                <span>{getReadingTime(article?.content)} min read</span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors duration-150 ease-out line-clamp-2">
                  {article?.title}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                  {article?.excerpt}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {article?.tags?.slice(0, 3)?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Image
                  src={article?.author?.avatar}
                  alt={article?.author?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-text-secondary">{article?.author?.name}</span>
              </div>
              <Link
                to={`/notes/${article?.slug}`}
                className="text-accent hover:text-accent/80 text-sm font-medium flex items-center space-x-1 transition-colors duration-150 ease-out"
              >
                <span>Read more</span>
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ease-out group">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article?.featuredImage}
          alt={article?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <time dateTime={article?.publishedAt}>
            {formatDate(article?.publishedAt)}
          </time>
          <span>•</span>
          <span>{getReadingTime(article?.content)} min read</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors duration-150 ease-out line-clamp-2">
            {article?.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
            {article?.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {article?.tags?.slice(0, 2)?.map((tag) => (
            <span
              key={tag}
              className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Image
              src={article?.author?.avatar}
              alt={article?.author?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-text-secondary">{article?.author?.name}</span>
          </div>
          <Link
            to={`/notes/${article?.slug}`}
            className="text-accent hover:text-accent/80 text-sm font-medium flex items-center space-x-1 transition-colors duration-150 ease-out"
          >
            <span>Read</span>
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;