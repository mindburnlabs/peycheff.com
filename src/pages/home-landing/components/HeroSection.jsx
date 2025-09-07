import React from 'react';
import InteractivePreview from './InteractivePreview';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center" style={{ paddingTop: '104px' }}>
      <div className="apple-container">
        <div className="text-center space-y-8">
          {/* Main heading with Apple typography */}
          <div className="space-y-6">
            <h1 className="text-[56px] md:text-[64px] lg:text-[72px] leading-[64px] md:leading-[72px] lg:leading-[80px] font-semibold tracking-[-0.02em] text-[#F2F3F5] max-w-5xl mx-auto">
              Turn your idea into a shippable product in 30 days.
            </h1>
            <p className="text-[18px] leading-[28px] tracking-[0] text-[#A5ABB3] max-w-3xl mx-auto">
              Get a personalized sprint plan that actually works. No theory, no fluff—just the exact steps to build and ship your v1.
            </p>
          </div>
          
          {/* Interactive Preview */}
          <div className="pt-8">
            <InteractivePreview />
          </div>
        </div>

        {/* Proof strip */}
        <div className="mt-24 pt-16 border-t hairline-border">
          <div className="space-y-4 text-center">
            <div className="text-[14px] leading-[22px] text-[#A5ABB3] baseline-16">
              Built an NFT project in ~4 months → sold out ~$2.5M in ~30 minutes
            </div>
            <div className="text-[14px] leading-[22px] text-[#A5ABB3] baseline-16">
              Now: Mindburn Labs — AI-powered apps and automations
            </div>
            <div className="text-[14px] leading-[22px] text-[#A5ABB3]">
              I prefer tiny, focused teams over committees and buzzwords
            </div>
          </div>
        </div>

        {/* Work highlights */}
        <div className="mt-24 space-y-6">
          <div className="apple-card">
            <div className="space-y-2">
              <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Lucky Maneki NFT</h3>
              <p className="text-[14px] leading-[22px] text-[#A5ABB3]">Context → System → Result (sold out ~$2.5M in ~30 minutes)</p>
            </div>
          </div>
          
          <div className="apple-card">
            <div className="space-y-2">
              <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Personal Ops Automations</h3>
              <p className="text-[14px] leading-[22px] text-[#A5ABB3]">scripts + agents → reclaimed hours weekly</p>
            </div>
          </div>
          
          <div className="apple-card">
            <div className="space-y-2">
              <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Telegram Micro-Automations</h3>
              <p className="text-[14px] leading-[22px] text-[#A5ABB3]">bots for capture/drip/handoff → higher reply rates</p>
            </div>
          </div>
          
          <div className="apple-card">
            <div className="space-y-2">
              <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Mindburn Labs (active)</h3>
              <p className="text-[14px] leading-[22px] text-[#A5ABB3]">30-day sprints → first utilities live</p>
            </div>
          </div>
        </div>

        {/* Notes preview */}
        <div className="mt-24 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-[24px] leading-[32px] font-medium text-[#F2F3F5]">Notes</h2>
            <a 
              href="/notes-content-hub" 
              className="text-[14px] leading-[22px] text-[#A5ABB3] hover:text-[#F2F3F5] apple-motion focus-visible-accent"
            >
              View all →
            </a>
          </div>
          
          <div className="space-y-4">
            <a href="/notes/30-day-sprint" className="block apple-card hover:border-[rgba(10,132,255,0.2)] focus-visible-accent">
              <div className="space-y-2">
                <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">A 30-Day Idea→Product Sprint That Actually Works</h3>
                <p className="text-[14px] leading-[22px] text-[#A5ABB3]">The exact framework I use to ship v1s fast</p>
              </div>
            </a>
            
            <a href="/notes/micro-automations" className="block apple-card hover:border-[rgba(10,132,255,0.2)] focus-visible-accent">
              <div className="space-y-2">
                <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Micro-Automations for Solo Founders</h3>
                <p className="text-[14px] leading-[22px] text-[#A5ABB3]">Small scripts that reclaim your time</p>
              </div>
            </a>
            
            <a href="/notes/shipping-after-bad-year" className="block apple-card hover:border-[rgba(10,132,255,0.2)] focus-visible-accent">
              <div className="space-y-2">
                <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Shipping After a Bad Year</h3>
                <p className="text-[14px] leading-[22px] text-[#A5ABB3]">How scar tissue beats theory every time</p>
              </div>
            </a>
          </div>
        </div>

        {/* Advisory teaser */}
        <div className="mt-24 space-y-6">
          <h2 className="text-[24px] leading-[32px] font-medium text-[#F2F3F5]">Advisory</h2>
          
          <div className="space-y-4">
            <div className="apple-card">
              <div className="space-y-2">
                <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Sparring (90 min)</h3>
                <p className="text-[14px] leading-[22px] text-[#A5ABB3]">ruthless clarity + a 1-page plan in 24h</p>
              </div>
            </div>
            
            <div className="apple-card">
              <div className="space-y-2">
                <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Systems Audit (10 days)</h3>
                <p className="text-[14px] leading-[22px] text-[#A5ABB3]">rebuild the loop and prove it with metrics</p>
              </div>
            </div>
            
            <div className="apple-card">
              <div className="space-y-2">
                <h3 className="text-[16px] leading-[26px] font-medium text-[#F2F3F5]">Build Sprint (30 days)</h3>
                <p className="text-[14px] leading-[22px] text-[#A5ABB3]">a usable v1, not a deck</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <a 
              href="/advisory-services" 
              className="apple-button focus-visible-accent"
            >
              Start an engagement
            </a>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-[14px] leading-[22px] text-[#A5ABB3] italic">
              "Ivan shipped our v1 in weeks, not months. His systems thinking is next-level."
            </p>
            <p className="text-[14px] leading-[22px] text-[#A5ABB3] italic">
              "Finally, someone who gets that execution beats perfect planning every time."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;