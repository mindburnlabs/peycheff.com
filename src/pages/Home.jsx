import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <>
      <SEO />
      {/* Hero - Hyper minimal, massive impact */}
      <section className="px-6 pt-32 pb-24">
        <div className="max-w-container mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-h1 mb-8 leading-[1.1]">
              I build small teams that ship disproportionate outcomes.
            </h1>
            <p className="text-[24px] leading-[1.4] text-muted-foreground mb-16">
              Founder & systems designer. I turn vague ideas into shippable products—fast.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to="/advisory" 
              className="bg-accent text-white px-8 py-4 text-[18px] font-medium rounded-xl hover:-translate-y-0.5 transition-transform duration-120"
            >
              Work with me
            </Link>
            <Link 
              to="/notes" 
              className="text-accent px-8 py-4 text-[18px] font-medium hover:opacity-70 transition-opacity duration-120"
            >
              Read my notes
            </Link>
            <button className="text-muted-foreground px-8 py-4 text-[18px] font-medium hover:text-foreground transition-colors duration-120">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Proof - No cards, just clean facts */}
      <section className="px-6 py-24 border-y border-border">
        <div className="max-w-container mx-auto">
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-24">
            <div>
              <p className="text-[18px] leading-[1.5]">
                Co-created a generative NFT collection that <strong>sold out in ~30 minutes</strong> (2021)
              </p>
            </div>
            <div>
              <p className="text-[18px] leading-[1.5]">
                Now building <strong>AI-powered utilities & micro-automations</strong>
              </p>
            </div>
            <div>
              <p className="text-[18px] leading-[1.5]">
                I choose <strong>tiny, focused teams</strong> over committees and buzzwords
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work - List format, not cards */}
      <section className="px-6 py-32">
        <div className="max-w-container mx-auto">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-h2 sticky top-32">
                Recent work
              </h2>
            </div>
            <div className="lg:col-span-9 space-y-16">
              <div className="group">
                <h3 className="text-[20px] font-semibold mb-2 group-hover:text-accent transition-colors duration-120">
                  Generative NFT launch (2021)
                </h3>
                <p className="text-[18px] leading-[1.6] text-muted-foreground">
                  lean art pipeline & timed drop → sold out in ~30 minutes
                </p>
              </div>
              
              <div className="group">
                <h3 className="text-[20px] font-semibold mb-2 group-hover:text-accent transition-colors duration-120">
                  Personal ops automations
                </h3>
                <p className="text-[18px] leading-[1.6] text-muted-foreground">
                  scripts/agents for intake, outreach, publishing → hours reclaimed weekly
                </p>
              </div>
              
              <div className="group">
                <h3 className="text-[20px] font-semibold mb-2 group-hover:text-accent transition-colors duration-120">
                  Telegram micro-automations
                </h3>
                <p className="text-[18px] leading-[1.6] text-muted-foreground">
                  capture → drip → handoff bots → higher reply rates & cleaner pipeline
                </p>
              </div>
              
              <div className="group">
                <h3 className="text-[20px] font-semibold mb-2 group-hover:text-accent transition-colors duration-120">
                  AI utilities (active)
                </h3>
                <p className="text-[18px] leading-[1.6] text-muted-foreground">
                  30-day sprints, opinionated UX → first tools live; user tests expanding
                </p>
              </div>
              
              <div className="pt-8">
                <Link 
                  to="/work" 
                  className="text-accent font-medium hover:opacity-70 transition-opacity duration-120"
                >
                  View all work →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory - Minimal, confident */}
      <section className="px-6 py-32 bg-surface/50">
        <div className="max-w-container mx-auto">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <h2 className="text-h2 mb-6">
                Advisory
              </h2>
              <p className="text-[18px] leading-[1.6] text-muted-foreground">
                Pick the pressure you want. Outcomes only.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[20px] font-semibold mb-2">Sparring (90 min)</h3>
                    <p className="text-muted-foreground">→ 1-page plan in 24h</p>
                  </div>
                  <div className="text-[20px] font-semibold text-accent">$500</div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[20px] font-semibold mb-2">Systems Audit (10 days)</h3>
                    <p className="text-muted-foreground">→ redesigned cadence + metrics</p>
                  </div>
                  <div className="text-[20px] font-semibold text-accent">$5,000</div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[20px] font-semibold mb-2">Build Sprint (30 days)</h3>
                    <p className="text-muted-foreground">→ usable v1 shipped</p>
                  </div>
                  <div className="text-[20px] font-semibold text-accent">$25,000</div>
                </div>
              </div>
              
              <div className="pt-12">
                <Link 
                  to="/advisory" 
                  className="bg-accent text-white px-8 py-4 text-[18px] font-medium rounded-xl hover:-translate-y-0.5 transition-transform duration-120 inline-block"
                >
                  Start an engagement
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
