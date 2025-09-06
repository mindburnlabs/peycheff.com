import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import NewsletterSubscription from '../../components/ui/NewsletterSubscription';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import SearchAndFilter from './components/SearchAndFilter';
import FeaturedArticles from './components/FeaturedArticles';
import ArticleGrid from './components/ArticleGrid';
import ReadingProgress from './components/ReadingProgress';

const NotesContentHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock articles data
  const allArticles = [
    {
      id: 1,
      title: "Building Scalable Systems: Lessons from High-Growth Startups",
      slug: "building-scalable-systems-lessons",
      excerpt: `Scaling a system isn't just about handling more users—it's about building architecture that can evolve with your business needs.\n\nIn this deep dive, I explore the key principles and patterns that successful startups use to build systems that scale gracefully from thousands to millions of users.`,
      content: `Scaling a system isn't just about handling more users—it's about building architecture that can evolve with your business needs. In this comprehensive guide, I'll walk you through the essential principles and real-world strategies that have helped startups successfully scale from thousands to millions of users. We'll explore microservices architecture, database sharding strategies, caching layers, and the critical decisions that can make or break your scaling efforts. Drawing from my experience working with high-growth companies, I'll share specific examples of what works, what doesn't, and how to avoid the common pitfalls that can derail your scaling journey.`,
      featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
      publishedAt: "2025-01-15T10:00:00Z",
      tags: ["Systems Design", "Scalability", "Architecture"],
      author: {
        name: "Ivan Peychev",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featured: true,
      readingTime: 8
    },
    {
      id: 2,
      title: "The Product Manager\'s Guide to Technical Debt",
      slug: "product-manager-guide-technical-debt",
      excerpt: `Technical debt isn't just an engineering problem—it's a business strategy decision that requires careful product management.\n\nLearn how to identify, prioritize, and communicate technical debt to stakeholders while maintaining product velocity.`,
      content: `Technical debt isn't just an engineering problem—it's a business strategy decision that requires careful product management. As a product manager, understanding technical debt is crucial for making informed decisions about feature development, resource allocation, and long-term product strategy. This guide covers how to identify different types of technical debt, create frameworks for prioritization, and effectively communicate the business impact to stakeholders. I'll share practical approaches for balancing new feature development with debt reduction, and provide templates for tracking and reporting on technical debt initiatives.`,
      featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      publishedAt: "2025-01-10T14:30:00Z",
      tags: ["Product Management", "Technical Debt", "Strategy"],
      author: {
        name: "Ivan Peychev",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featured: false,
      readingTime: 6
    },
    {
      id: 3,
      title: "Leadership in Remote-First Organizations",
      slug: "leadership-remote-first-organizations",
      excerpt: `Remote work has fundamentally changed how we lead teams. Traditional management approaches often fall short in distributed environments.\n\nDiscover the leadership principles and practices that drive success in remote-first companies.`,
      content: `Remote work has fundamentally changed how we lead teams. Traditional management approaches often fall short in distributed environments where face-to-face interaction is limited and team members span different time zones and cultures. This article explores the unique challenges of remote leadership and provides actionable strategies for building trust, maintaining team cohesion, and driving performance in distributed teams. I'll cover communication frameworks, decision-making processes, and the tools and practices that successful remote leaders use to create high-performing teams regardless of physical location.`,
      featuredImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop",
      publishedAt: "2025-01-05T09:15:00Z",
      tags: ["Leadership", "Remote Work", "Team Management"],
      author: {
        name: "Ivan Peychev",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featured: true,
      readingTime: 7
    },
    {
      id: 4,
      title: "API Design Principles for Modern Applications",
      slug: "api-design-principles-modern-applications",
      excerpt: `Well-designed APIs are the backbone of modern software architecture. They enable seamless integration and long-term maintainability.\n\nExplore the fundamental principles and best practices for designing APIs that developers love to use.`,
      content: `Well-designed APIs are the backbone of modern software architecture. They enable seamless integration, promote code reusability, and ensure long-term maintainability of your systems. This comprehensive guide covers the fundamental principles of API design, from RESTful conventions to GraphQL considerations. I'll walk you through versioning strategies, error handling patterns, authentication approaches, and documentation best practices. Whether you're building internal APIs for microservices or public APIs for third-party developers, these principles will help you create interfaces that are intuitive, reliable, and scalable.`,
      featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
      publishedAt: "2024-12-28T16:45:00Z",
      tags: ["Systems Design", "API Design", "Architecture"],
      author: {
        name: "Ivan Peychev",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featured: false,
      readingTime: 9
    },
    {
      id: 5,
      title: "Startup Fundraising: Beyond the Pitch Deck",
      slug: "startup-fundraising-beyond-pitch-deck",
      excerpt: `Successful fundraising is about more than having a great pitch deck. It's about building relationships and demonstrating traction.\n\nLearn the strategies that help startups secure funding in competitive markets.`,content: `Successful fundraising is about more than having a great pitch deck. It's about building relationships, demonstrating traction, and telling a compelling story that resonates with investors. This article goes beyond the basics of pitch deck creation to explore the nuanced aspects of fundraising that many founders overlook. I'll cover investor research and targeting, the importance of warm introductions, how to handle due diligence, and strategies for negotiating terms. Drawing from my experience advising startups through funding rounds, I'll share insights on timing, preparation, and the common mistakes that can derail fundraising efforts.`,
      featuredImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
      publishedAt: "2024-12-20T11:20:00Z",
      tags: ["Startup Strategy", "Fundraising", "Leadership"],
      author: {
        name: "Ivan Peychev",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featured: false,
      readingTime: 10
    },
    {
      id: 6,
      title: "The Future of Work: AI and Human Collaboration",
      slug: "future-work-ai-human-collaboration",
      excerpt: `AI isn't replacing human workers—it's augmenting human capabilities and creating new opportunities for collaboration.\n\nExplore how organizations can successfully integrate AI while empowering their human workforce.`,
      content: `AI isn't replacing human workers—it's augmenting human capabilities and creating new opportunities for collaboration. As AI tools become more sophisticated and accessible, the key to success lies in understanding how to effectively combine artificial intelligence with human creativity, empathy, and strategic thinking. This article explores the evolving landscape of human-AI collaboration, examining successful case studies and practical frameworks for integration. I'll discuss the skills that become more valuable in an AI-augmented workplace, strategies for reskilling teams, and how to build organizational cultures that embrace both technological advancement and human potential.`,
      featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      publishedAt: "2024-12-15T13:10:00Z",
      tags: ["Industry Trends", "AI", "Future of Work"],
      author: {
        name: "Ivan Peychev",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      featured: false,
      readingTime: 8
    }
  ];

  const featuredArticles = allArticles?.filter(article => article?.featured);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let filtered = [...allArticles];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered?.filter(article =>
          article?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          article?.excerpt?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          article?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
        );
      }

      // Apply category filters
      if (activeFilters?.length > 0 && !activeFilters?.includes('all')) {
        filtered = filtered?.filter(article =>
          article?.tags?.some(tag => 
            activeFilters?.some(filter => 
              tag?.toLowerCase()?.replace(/\s+/g, '-') === filter
            )
          )
        );
      }

      setFilteredArticles(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterId) => {
    if (filterId === 'all') {
      setActiveFilters([]);
    } else {
      setActiveFilters(prev => 
        prev?.includes(filterId) 
          ? prev?.filter(id => id !== filterId)
          : [...prev, filterId]
      );
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Notes & Insights - Ivan Peychev | Systems Design & Leadership</title>
        <meta name="description" content="Explore Ivan Peychev's insights on systems design, leadership, and startup strategy. In-depth articles and commentary on building scalable products and teams." />
        <meta name="keywords" content="systems design, leadership, startup strategy, product management, technical insights, Ivan Peychev" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Notes & Insights - Ivan Peychev" />
        <meta property="og:description" content="In-depth articles on systems design, leadership, and startup strategy from experienced founder Ivan Peychev." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ivanpeychev.com/notes-content-hub" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Notes & Insights - Ivan Peychev" />
        <meta name="twitter:description" content="In-depth articles on systems design, leadership, and startup strategy." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop" />
      </Helmet>
      <ReadingProgress />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Notes & Insights
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                  Deep dives into systems design, leadership, and startup strategy. 
                  Practical insights from building and scaling products and teams.
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Icon name="BookOpen" size={16} />
                  <span>24 Articles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} />
                  <span>Updated Weekly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={16} />
                  <span>2.5K Subscribers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <SearchAndFilter
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
            />
          </div>
        </section>

        {/* Featured Articles */}
        {!searchQuery && activeFilters?.length === 0 && (
          <section className="pb-12 px-6">
            <div className="max-w-7xl mx-auto">
              <FeaturedArticles articles={featuredArticles} />
            </div>
          </section>
        )}

        {/* All Articles */}
        <section className="pb-12 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                {searchQuery || activeFilters?.length > 0 ? 'Search Results' : 'All Articles'}
              </h2>
              <div className="text-sm text-text-secondary">
                {filteredArticles?.length} article{filteredArticles?.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <ArticleGrid articles={filteredArticles} loading={loading} />
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-2xl mx-auto">
            <NewsletterSubscription
              title="Never Miss an Insight"
              description="Get my latest articles on systems design, leadership, and startup strategy delivered directly to your inbox. No spam, just valuable insights."
            />
          </div>
        </section>

        {/* Scroll to Top Button */}
        <Button
          variant="default"
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg z-30"
          aria-label="Scroll to top"
        >
          <Icon name="ArrowUp" size={20} />
        </Button>
      </main>
      <Footer />
    </>
  );
};

export default NotesContentHub;