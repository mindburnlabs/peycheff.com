import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Notes = () => {
  const [email, setEmail] = useState('');
  const reducedMotion = useReducedMotion();

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

  const fadeInUp = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1
      }
    }
  };

  return (
    <div className="narrative-section py-24">
      <div>
        {/* Header */}
        <motion.section 
          className="py-20 text-center"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.h1 
            className="heading-1 mb-6"
            variants={fadeInUp}
          >
            Notes
          </motion.h1>
          <motion.p 
            className="text-h3 text-muted-foreground max-w-2xl mx-auto mb-12"
            variants={fadeInUp}
          >
            Operator notes—practical systems, shipped in public.
          </motion.p>
          
          {/* Top Subscribe Box */}
          <motion.form 
            onSubmit={handleSubscribe} 
            className="max-w-md mx-auto"
            variants={fadeInUp}
          >
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-input border border-border rounded-lg px-4 py-3 focus-ring placeholder-muted-foreground"
                required
              />
              <motion.button
                type="submit"
                className="btn-primary px-6"
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.form>
        </motion.section>

        {/* Seed Posts */}
        <motion.section 
          className="py-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="space-y-8">
            {seedPosts.map((post, index) => (
              <motion.article 
                key={index}
                className="surface p-8 hover:-translate-y-px transition-all duration-160 cursor-pointer"
                onClick={() => console.log('Navigate to post:', post.title)}
                variants={fadeInUp}
                whileHover={reducedMotion ? {} : { y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
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
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* RSS and Additional Info */}
        <motion.section 
          className="py-16 text-center border-t border-border"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="space-y-4">
            <motion.p 
              className="body-text text-muted-foreground"
              variants={fadeInUp}
            >
              New posts published weekly. No spam, unsubscribe anytime.
            </motion.p>
            <motion.div 
              className="flex items-center justify-center space-x-6 text-small"
              variants={staggerChildren}
            >
              <motion.a 
                href="/rss.xml" 
                className="link"
                variants={fadeInUp}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
              >
                RSS Feed
              </motion.a>
              <span className="text-border">·</span>
              <motion.a 
                href="/notes/archive" 
                className="link"
                variants={fadeInUp}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
              >
                All Posts
              </motion.a>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Notes;
