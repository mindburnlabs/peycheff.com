import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useScrollAnimation, scrollAnimationVariants } from '../utils/scrollAnimations';
import { Tooltip } from '../components/InteractiveElements';

const Home = () => {
  const [heroRef, heroVisible] = useScrollAnimation(0.2);
  const [proofRef, proofVisible] = useScrollAnimation(0.3);
  const [workRef, workVisible] = useScrollAnimation(0.2);
  const [advisoryRef, advisoryVisible] = useScrollAnimation(0.2);

  return (
    <>
      <SEO />
      {/* Hero - Hyper minimal, massive impact */}
      <section className="px-6 pt-40 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent opacity-50" />
        <motion.div 
          ref={heroRef}
          className="max-w-container mx-auto relative z-10"
          variants={scrollAnimationVariants.stagger}
          initial="hidden"
          animate={heroVisible ? "visible" : "hidden"}
        >
          <motion.div 
            className="max-w-4xl"
            variants={scrollAnimationVariants.fadeInUp}
          >
            <motion.h1 
              className="text-h1 mb-8 leading-[1.1] bg-gradient-to-r from-foreground to-gray-300 bg-clip-text text-transparent"
              variants={scrollAnimationVariants.fadeInUp}
            >
              I build small teams that ship disproportionate outcomes.
            </motion.h1>
            <motion.p 
              className="text-body-lg leading-[1.4] text-gray-300 mb-16"
              variants={scrollAnimationVariants.fadeInUp}
            >
              Founder & systems designer. I turn vague ideas into shippable products—fast.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap items-center gap-4"
            variants={scrollAnimationVariants.fadeInUp}
          >
            <Link 
              to="/advisory" 
              className="btn-primary hover-spring"
            >
              Work with me
            </Link>
            <Link 
              to="/notes" 
              className="btn-ghost hover-spring"
            >
              Read my notes
            </Link>
            <Tooltip content="Get notified about new posts and updates">
              <button className="btn-ghost hover-spring">
                Subscribe
              </button>
            </Tooltip>
          </motion.div>
        </motion.div>
      </section>

      {/* Proof - Clean facts with subtle animations */}
      <section className="px-6 py-32 relative">
        <div className="absolute inset-0 glass-light opacity-50" />
        <motion.div 
          ref={proofRef}
          className="max-w-container mx-auto relative z-10"
          variants={scrollAnimationVariants.stagger}
          initial="hidden"
          animate={proofVisible ? "visible" : "hidden"}
        >
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-24">
            <motion.div 
              className="group cursor-pointer"
              variants={scrollAnimationVariants.fadeInLeft}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="floating p-6 rounded-xl border border-border/30 bg-surface/20 backdrop-blur-sm">
                <p className="text-body leading-[1.6] text-text-primary">
                  Co-created a generative NFT collection that <strong className="text-accent">sold out in ~30 minutes</strong> (2021)
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="group cursor-pointer"
              variants={scrollAnimationVariants.fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="floating p-6 rounded-xl border border-border/30 bg-surface/20 backdrop-blur-sm">
                <p className="text-body leading-[1.6] text-text-primary">
                  Now building <strong className="text-accent">AI-powered utilities & micro-automations</strong>
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="group cursor-pointer"
              variants={scrollAnimationVariants.fadeInRight}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="floating p-6 rounded-xl border border-border/30 bg-surface/20 backdrop-blur-sm">
                <p className="text-body leading-[1.6] text-text-primary">
                  I choose <strong className="text-accent">tiny, focused teams</strong> over committees and buzzwords
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Work - Enhanced list format with animations */}
      <section className="px-6 py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-gray-950/30 to-background" />
        <motion.div 
          ref={workRef}
          className="max-w-container mx-auto relative z-10"
          variants={scrollAnimationVariants.stagger}
          initial="hidden"
          animate={workVisible ? "visible" : "hidden"}
        >
          <div className="grid lg:grid-cols-12 gap-16">
            <motion.div 
              className="lg:col-span-3"
              variants={scrollAnimationVariants.fadeInLeft}
            >
              <h2 className="text-h2 sticky top-32 bg-gradient-to-r from-foreground to-text-secondary bg-clip-text text-transparent">
                Recent work
              </h2>
            </motion.div>
            <div className="lg:col-span-9 space-y-16">
              <motion.div 
                className="group cursor-pointer hover-spring p-6 -m-6 rounded-xl transition-colors duration-300"
                variants={scrollAnimationVariants.fadeInUp}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">
                  Generative NFT launch (2021)
                </h3>
                <p className="text-body leading-[1.6] text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">
                  lean art pipeline & timed drop → sold out in ~30 minutes
                </p>
              </motion.div>
              
              <motion.div 
                className="group cursor-pointer hover-spring p-6 -m-6 rounded-xl transition-colors duration-300"
                variants={scrollAnimationVariants.fadeInUp}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">
                  Personal ops automations
                </h3>
                <p className="text-body leading-[1.6] text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">
                  scripts/agents for intake, outreach, publishing → hours reclaimed weekly
                </p>
              </motion.div>
              
              <motion.div 
                className="group cursor-pointer hover-spring p-6 -m-6 rounded-xl transition-colors duration-300"
                variants={scrollAnimationVariants.fadeInUp}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">
                  Telegram micro-automations
                </h3>
                <p className="text-body leading-[1.6] text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">
                  capture → drip → handoff bots → higher reply rates & cleaner pipeline
                </p>
              </motion.div>
              
              <motion.div 
                className="group cursor-pointer hover-spring p-6 -m-6 rounded-xl transition-colors duration-300"
                variants={scrollAnimationVariants.fadeInUp}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">
                  AI utilities (active)
                  <span className="ml-3 inline-flex items-center px-2 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">
                    Live
                  </span>
                </h3>
                <p className="text-body leading-[1.6] text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">
                  30-day sprints, opinionated UX → first tools live; user tests expanding
                </p>
              </motion.div>
              
              <motion.div 
                className="pt-8"
                variants={scrollAnimationVariants.fadeInUp}
              >
                <Link 
                  to="/work" 
                  className="link-primary hover-spring inline-flex items-center group"
                >
                  View all work
                  <motion.span
                    className="ml-2 transition-transform duration-200"
                    whileHover={{ x: 4 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advisory - Enhanced with glassmorphism */}
      <section className="px-6 py-32 relative overflow-hidden">
        <div className="absolute inset-0 glass opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/5" />
        <motion.div 
          ref={advisoryRef}
          className="max-w-container mx-auto relative z-10"
          variants={scrollAnimationVariants.stagger}
          initial="hidden"
          animate={advisoryVisible ? "visible" : "hidden"}
        >
          <div className="grid lg:grid-cols-12 gap-16">
            <motion.div 
              className="lg:col-span-4"
              variants={scrollAnimationVariants.fadeInLeft}
            >
              <h2 className="text-h2 mb-6 bg-gradient-to-r from-foreground to-text-secondary bg-clip-text text-transparent">
                Advisory
              </h2>
              <p className="text-body-lg leading-[1.6] text-text-tertiary">
                Pick the pressure you want. Outcomes only.
              </p>
            </motion.div>
            <div className="lg:col-span-8">
              <div className="space-y-8">
                <motion.div 
                  className="card group cursor-pointer hover-spring"
                  variants={scrollAnimationVariants.fadeInRight}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">Sparring (90 min)</h3>
                      <p className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">→ 1-page plan in 24h</p>
                    </div>
                    <div className="text-h4 font-semibold text-accent">$500</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="card group cursor-pointer hover-spring"
                  variants={scrollAnimationVariants.fadeInRight}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">Systems Audit (10 days)</h3>
                      <p className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">→ redesigned cadence + metrics</p>
                    </div>
                    <div className="text-h4 font-semibold text-accent">$5,000</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="card group cursor-pointer hover-spring relative overflow-hidden"
                  variants={scrollAnimationVariants.fadeInRight}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">Build Sprint (30 days)</h3>
                      <p className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">→ usable v1 shipped</p>
                    </div>
                    <div className="text-h4 font-semibold text-accent">$25,000</div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="pt-12"
                variants={scrollAnimationVariants.fadeInUp}
              >
                <Link 
                  to="/advisory" 
                  className="btn-primary hover-spring inline-flex items-center group"
                >
                  Start an engagement
                  <motion.span
                    className="ml-2 transition-transform duration-200"
                    whileHover={{ x: 4 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Home;
