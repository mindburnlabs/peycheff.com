import React, { useState } from 'react';

const Notes = () => {
  const [email, setEmail] = useState('');

  const seedPosts = [
    {
      title: "A 30-Day Idea→Product Sprint That Actually Works",
      excerpt: "Most product sprints are theater. Here's a framework that consistently delivers usable v1s in 30 days with tiny teams.",
      date: "Dec 2024",
      readTime: "8 min read"
    },
    {
      title: "Micro-Automations for Solo Founders",
      excerpt: "Scripts and agents that reclaim hours weekly. Real examples from intake to outreach to publishing pipelines.",
      date: "Nov 2024", 
      readTime: "6 min read"
    },
    {
      title: "Shipping After a Bad Year",
      excerpt: "In 2022 I lost ~a million, went through divorce, got covid. I kept shipping. What I learned about momentum when everything breaks.",
      date: "Oct 2024",
      readTime: "12 min read"
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Integrate with Supabase/Resend
    console.log('Subscribe:', email);
  };

  return (
    <div className="py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="heading-1 mb-6">Notes</h1>
          <p className="text-h3 text-muted-foreground max-w-2xl mx-auto mb-12">
            Operator notes—practical systems, shipped in public.
          </p>
          
          {/* Top Subscribe Box */}
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground"
                required
              />
              <button
                type="submit"
                className="btn-primary px-6"
              >
                Subscribe
              </button>
            </div>
          </form>
        </section>

        {/* Seed Posts */}
        <section className="py-12">
          <div className="space-y-8">
            {seedPosts.map((post, index) => (
              <article 
                key={index}
                className="surface p-8 hover:-translate-y-px transition-all duration-160 cursor-pointer"
                onClick={() => console.log('Navigate to post:', post.title)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 text-small text-muted-foreground">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <h2 className="heading-2 mb-4 hover:text-accent transition-colors duration-160">
                  {post.title}
                </h2>
                
                <p className="body-text text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="mt-6">
                  <span className="link text-small">
                    Read more →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* RSS and Additional Info */}
        <section className="py-16 text-center border-t border-border">
          <div className="space-y-4">
            <p className="body-text text-muted-foreground">
              New posts published weekly. No spam, unsubscribe anytime.
            </p>
            <div className="flex items-center justify-center space-x-6 text-small">
              <a href="/rss.xml" className="link">
                RSS Feed
              </a>
              <span className="text-border">·</span>
              <a href="/notes/archive" className="link">
                All Posts
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Notes;
