import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { isFeatureEnabled } from '../lib/experiments';
import { useScrollAnimation, scrollAnimationVariants } from '../utils/scrollAnimations';
import { Tooltip } from '../components/InteractiveElements';
import CheckoutCopilot from '../components/CheckoutCopilot';
import useReducedMotion from '../hooks/useReducedMotion';
import { GlassCard, AppleButton, AppleInput, AppleProgress } from '../components/ui/AppleUI';

const Home = () => {
  const reducedMotion = useReducedMotion();
  const [heroRef, heroVisible] = useScrollAnimation(reducedMotion ? 1 : 0.2);
  const [proofRef, proofVisible] = useScrollAnimation(reducedMotion ? 1 : 0.3);
  const [workRef, workVisible] = useScrollAnimation(reducedMotion ? 1 : 0.2);
  const [advisoryRef, advisoryVisible] = useScrollAnimation(reducedMotion ? 1 : 0.2);

  const [goal, setGoal] = useState('Ship a usable v1 in 30 days');
  const [stack, setStack] = useState('React + Node + Supabase');
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [email, setEmail] = useState('');
  const runPreview = async (e) => {
    e?.preventDefault?.();
    try {
      setLoadingPreview(true);
      setPreview(null);
      // Optional email gate
      if (isFeatureEnabled('PREVIEW_EMAIL_GATE') && !email) {
        throw new Error('Please enter your email to see the preview.');
      }

      const res = await fetch('/.netlify/functions/preview-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, stack })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Preview failed');
      setPreview(data);
    } catch (err) {
      console.error('Preview error', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const startCheckout = async () => {
    const { createCheckoutSession } = await import('../lib/stripe');
    await createCheckoutSession('PACK_30DAY', {
      context: { goal, stack },
    }, 'AUDIT_PRO');
  };

  return (
    <>
      <SEO />
      {/* Hero - Hyper minimal, massive impact */}
      <section className="narrative-section pt-40 pb-32 relative overflow-hidden">
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
            className="flex flex-col gap-6"
            variants={scrollAnimationVariants.fadeInUp}
          >
            <GlassCard className="p-8 max-w-3xl">
              <form onSubmit={runPreview} className="grid md:grid-cols-3 gap-4">
                {isFeatureEnabled('PREVIEW_EMAIL_GATE') && (
                  <div className="md:col-span-3">
                    <AppleInput
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      label="Email"
                      required
                    />
                  </div>
                )}
                <AppleInput
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ship a SaaS in 30 days"
                  label="Your Goal"
                  required
                />
                <AppleInput
                  type="text"
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  placeholder="React + Node + Supabase"
                  label="Tech Stack"
                  required
                />
                <AppleButton
                  type="submit"
                  loading={loadingPreview}
                  variant="primary"
                  className="h-full"
                >
                  {loadingPreview ? 'Generating…' : 'Try 30‑second preview'}
                </AppleButton>
              </form>
            </GlassCard>

            <div className="flex items-center gap-4">
              <AppleButton onClick={startCheckout} variant="primary" size="lg">
                {(() => {
                  try {
                    const { getExperimentVariant } = require('../lib/experiments');
                    const label = getExperimentVariant('HERO_CTA_VARIANT');
                    return label || 'Generate my plan';
                  } catch (e) {
                    return 'Generate my plan';
                  }
                })()}
              </AppleButton>
              <span className="text-sm text-muted-foreground">Preview shows Week‑1 only.</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Preview render */}
      {preview && (
        <section className="narrative-section pt-0 pb-12">
          <div>
            <div className="relative border border-border/30 rounded-xl p-6 bg-surface/40 overflow-hidden">
              <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                {preview.watermark}
              </div>
              <h3 className="text-h3 mb-4">Week‑1 outline</h3>
              <p className="text-muted-foreground mb-6">Goal: {preview.goal} • Stack: {preview.stack}</p>
              <div className="grid md:grid-cols-2 gap-6">
                {preview.week1?.map((d, i) => (
                  <div key={i} className="rounded-lg border border-border/30 p-4 bg-background/40">
                    <div className="font-semibold mb-2">{d.name}</div>
                    <ul className="list-disc pl-5 space-y-1 text-text-tertiary">
                      {d.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <AppleButton onClick={startCheckout} variant="primary">Generate my plan</AppleButton>
                <AppleButton onClick={runPreview} variant="secondary" loading={loadingPreview}>{loadingPreview ? 'Refreshing…' : 'Refresh preview'}</AppleButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Proof - Clean facts with subtle animations */}
      <section className="narrative-section py-24 relative">
        <div className="absolute inset-0 glass-light opacity-50" />
        <motion.div 
          ref={proofRef}
          className="relative z-10"
          variants={scrollAnimationVariants.stagger}
          initial="hidden"
          animate={proofVisible ? "visible" : "hidden"}
        >
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-20">
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
            <div className="lg:col-span-3">
              <CheckoutCopilot />
            </div>
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
      <section className="narrative-section py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-gray-950/30 to-background" />
        <motion.div 
          ref={workRef}
          className="relative z-10"
          variants={scrollAnimationVariants.stagger}
          initial="hidden"
          animate={workVisible ? "visible" : "hidden"}
        >
          <div className="grid lg:grid-cols-12 gap-12">
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
                  variants={scrollAnimationVariants.fadeInRight}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <GlassCard className="group cursor-pointer hover-spring">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">Sparring (90 min)</h3>
                        <p className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">→ 1-page plan in 24h</p>
                      </div>
                      <div className="text-h4 font-semibold text-accent">$500</div>
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div
                  variants={scrollAnimationVariants.fadeInRight}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <GlassCard className="group cursor-pointer hover-spring">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-h5 mb-3 group-hover:text-accent transition-colors duration-300">Systems Audit (10 days)</h3>
                        <p className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">→ redesigned cadence + metrics</p>
                      </div>
                      <div className="text-h4 font-semibold text-accent">$5,000</div>
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div
                  variants={scrollAnimationVariants.fadeInRight}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <GlassCard className="group cursor-pointer hover-spring relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full backdrop-blur-sm">
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
                  </GlassCard>
                </motion.div>
              </div>
              
              <motion.div 
                className="pt-12"
                variants={scrollAnimationVariants.fadeInUp}
              >
                <AppleButton 
                  as={Link}
                  to="/advisory" 
                  variant="primary"
                  size="lg"
                >
                  Start an engagement
                  <motion.span
                    className="ml-2 transition-transform duration-200"
                    whileHover={{ x: 4 }}
                  >
                    →
                  </motion.span>
                </AppleButton>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Home;
