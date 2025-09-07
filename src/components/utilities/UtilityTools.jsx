import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, PremiumButton, FloatingInput, Badge, ProgressBar } from '../ui/LinearUI';
import { cn } from '../../utils/cn';

// UTM Memory Tool - Save and recall tagged links
export const UTMMemory = ({ credits, onUse }) => {
  const [urls, setUrls] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');

  const generateUTM = () => {
    if (!baseUrl) return;
    
    const params = new URLSearchParams();
    if (utmSource) params.append('utm_source', utmSource);
    if (utmMedium) params.append('utm_medium', utmMedium);
    if (utmCampaign) params.append('utm_campaign', utmCampaign);
    if (utmTerm) params.append('utm_term', utmTerm);
    if (utmContent) params.append('utm_content', utmContent);
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    const taggedUrl = `${baseUrl}${separator}${params.toString()}`;
    
    const newUrl = {
      id: Date.now(),
      original: baseUrl,
      tagged: taggedUrl,
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      term: utmTerm,
      content: utmContent,
      created: new Date().toISOString()
    };
    
    setUrls([newUrl, ...urls]);
    onUse?.();
  };

  const exportCSV = () => {
    const headers = ['Original URL', 'Tagged URL', 'Source', 'Medium', 'Campaign', 'Term', 'Content', 'Created'];
    const rows = urls.map(u => [
      u.original, u.tagged, u.source, u.medium, u.campaign, u.term, u.content, u.created
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utm-links-${Date.now()}.csv`;
    a.click();
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">UTM Memory</h3>
          <p className="text-sm text-gray-400 mt-1">Create and save tagged marketing links</p>
        </div>
        <Badge variant="primary">{credits} credits</Badge>
      </div>

      <div className="space-y-4 mb-6">
        <FloatingInput
          label="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://example.com/page"
        />
        
        <div className="grid md:grid-cols-2 gap-4">
          <FloatingInput
            label="UTM Source (required)"
            value={utmSource}
            onChange={(e) => setUtmSource(e.target.value)}
            placeholder="google, newsletter"
          />
          <FloatingInput
            label="UTM Medium"
            value={utmMedium}
            onChange={(e) => setUtmMedium(e.target.value)}
            placeholder="cpc, email, social"
          />
          <FloatingInput
            label="UTM Campaign"
            value={utmCampaign}
            onChange={(e) => setUtmCampaign(e.target.value)}
            placeholder="spring_sale"
          />
          <FloatingInput
            label="UTM Term"
            value={utmTerm}
            onChange={(e) => setUtmTerm(e.target.value)}
            placeholder="running+shoes"
          />
        </div>
        
        <FloatingInput
          label="UTM Content"
          value={utmContent}
          onChange={(e) => setUtmContent(e.target.value)}
          placeholder="logolink, textlink"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <PremiumButton onClick={generateUTM} disabled={!baseUrl || !utmSource}>
          Generate Tagged URL
        </PremiumButton>
        {urls.length > 0 && (
          <PremiumButton variant="secondary" onClick={exportCSV}>
            Export CSV ({urls.length})
          </PremiumButton>
        )}
      </div>

      {/* Saved URLs */}
      <AnimatePresence>
        {urls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-400">Recent URLs</h4>
            {urls.slice(0, 5).map((url) => (
              <motion.div
                key={url.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">{url.campaign || 'No campaign'}</p>
                    <p className="text-sm text-white truncate">{url.tagged}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(url.tagged)}
                    className="ml-3 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// Note→Thread→Carousel Converter
export const NoteToThread = ({ credits, onUse }) => {
  const [note, setNote] = useState('');
  const [threads, setThreads] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateThreads = async () => {
    if (!note) return;
    
    setLoading(true);
    onUse?.();
    
    // Simulate AI processing (replace with actual API call)
    setTimeout(() => {
      const sentences = note.split('. ').filter(s => s.length > 0);
      
      // Generate LinkedIn thread
      const linkedinThread = sentences.reduce((acc, sent, i) => {
        if (i % 3 === 0) acc.push('');
        acc[acc.length - 1] += sent + '. ';
        return acc;
      }, []).map(para => para.trim());
      
      // Generate X/Twitter thread
      const twitterThread = sentences.reduce((acc, sent) => {
        if (sent.length <= 280) {
          acc.push(sent + '.');
        } else {
          // Split long sentences
          const words = sent.split(' ');
          let current = '';
          words.forEach(word => {
            if ((current + ' ' + word).length <= 270) {
              current += (current ? ' ' : '') + word;
            } else {
              acc.push(current + '...');
              current = '...' + word;
            }
          });
          if (current) acc.push(current + '.');
        }
        return acc;
      }, []);
      
      // Generate carousel slides
      const slides = sentences.reduce((acc, sent, i) => {
        if (i % 2 === 0) acc.push({ title: '', content: '' });
        if (i % 2 === 0) {
          acc[acc.length - 1].title = sent.slice(0, 50);
        } else {
          acc[acc.length - 1].content = sent;
        }
        return acc;
      }, []);
      
      setThreads({
        linkedin: linkedinThread,
        twitter: twitterThread,
        slides: slides.slice(0, 5)
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Note→Thread Converter</h3>
          <p className="text-sm text-gray-400 mt-1">Transform notes into social media threads</p>
        </div>
        <Badge variant="primary">{credits} credits</Badge>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">Your Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-32 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Paste your note here..."
        />
      </div>

      <PremiumButton onClick={generateThreads} loading={loading} disabled={!note}>
        Generate Threads
      </PremiumButton>

      {/* Results */}
      <AnimatePresence>
        {threads && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-6"
          >
            {/* LinkedIn Thread */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">LinkedIn Thread</h4>
              <div className="space-y-2">
                {threads.linkedin.map((para, i) => (
                  <div key={i} className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                    <p className="text-sm text-white">{para}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Twitter Thread */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">X/Twitter Thread</h4>
              <div className="space-y-2">
                {threads.twitter.map((tweet, i) => (
                  <div key={i} className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                    <p className="text-xs text-gray-500 mb-1">{i + 1}/{threads.twitter.length}</p>
                    <p className="text-sm text-white">{tweet}</p>
                    <p className="text-xs text-gray-500 mt-2">{tweet.length} chars</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Slides */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Carousel Slides</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {threads.slides.map((slide, i) => (
                  <div key={i} className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/[0.08]">
                    <p className="text-xs text-gray-400 mb-2">Slide {i + 1}</p>
                    <h5 className="text-sm font-semibold text-white mb-2">{slide.title}</h5>
                    <p className="text-xs text-gray-300">{slide.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// Headline Linearify Tool
export const HeadlineLinearify = ({ credits, onUse }) => {
  const [messy, setMessy] = useState('');
  const [variants, setVariants] = useState(null);

  const linearify = () => {
    if (!messy) return;
    
    onUse?.();
    
    // Clean and generate variants
    const clean = messy.trim().replace(/\s+/g, ' ');
    const words = clean.split(' ');
    
    // 56 char variant (main headline)
    const h56 = words.reduce((acc, word) => {
      if ((acc + ' ' + word).length <= 56) {
        return acc ? acc + ' ' + word : word;
      }
      return acc;
    }, '');
    
    // 36 char variant (subheading)
    const h36 = words.reduce((acc, word) => {
      if ((acc + ' ' + word).length <= 36) {
        return acc ? acc + ' ' + word : word;
      }
      return acc;
    }, '');
    
    // 24 char variant (button/compact)
    const h24 = words.reduce((acc, word) => {
      if ((acc + ' ' + word).length <= 24) {
        return acc ? acc + ' ' + word : word;
      }
      return acc;
    }, '');
    
    setVariants({
      h56: h56 || clean.slice(0, 56),
      h36: h36 || clean.slice(0, 36),
      h24: h24 || clean.slice(0, 24),
      original: clean
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Headline Linearify</h3>
          <p className="text-sm text-gray-400 mt-1">Convert messy headlines to Linear-style typography</p>
        </div>
        <Badge variant="primary">{credits} credits</Badge>
      </div>

      <div className="mb-6">
        <FloatingInput
          label="Messy Headline"
          value={messy}
          onChange={(e) => setMessy(e.target.value)}
          placeholder="Your unpolished headline here..."
        />
      </div>

      <PremiumButton onClick={linearify} disabled={!messy}>
        Linearify Headline
      </PremiumButton>

      {/* Variants */}
      <AnimatePresence>
        {variants && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
              <p className="text-xs text-gray-500 mb-2">56 chars - Main Headline</p>
              <p className="text-2xl font-semibold text-white">{variants.h56}</p>
              <p className="text-xs text-gray-500 mt-2">{variants.h56.length} / 56 chars</p>
            </div>
            
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
              <p className="text-xs text-gray-500 mb-2">36 chars - Subheading</p>
              <p className="text-xl font-medium text-white">{variants.h36}</p>
              <p className="text-xs text-gray-500 mt-2">{variants.h36.length} / 36 chars</p>
            </div>
            
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
              <p className="text-xs text-gray-500 mb-2">24 chars - Button/Compact</p>
              <p className="text-lg text-white">{variants.h24}</p>
              <p className="text-xs text-gray-500 mt-2">{variants.h24.length} / 24 chars</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// Pricing Heuristic Calculator
export const PricingHeuristic = ({ credits, onUse }) => {
  const [scope, setScope] = useState('small');
  const [risk, setRisk] = useState('low');
  const [timeline, setTimeline] = useState('relaxed');
  const [expertise, setExpertise] = useState('intermediate');
  const [pricing, setPricing] = useState(null);

  const calculate = () => {
    onUse?.();
    
    // Base rates
    const bases = {
      small: 5000,
      medium: 15000,
      large: 40000,
      enterprise: 100000
    };
    
    // Multipliers
    const riskMultipliers = { low: 1, medium: 1.3, high: 1.7, critical: 2.2 };
    const timelineMultipliers = { relaxed: 1, normal: 1.2, rush: 1.5, emergency: 2 };
    const expertiseMultipliers = { junior: 0.7, intermediate: 1, senior: 1.4, expert: 2 };
    
    const base = bases[scope];
    const finalPrice = Math.round(
      base * riskMultipliers[risk] * timelineMultipliers[timeline] * expertiseMultipliers[expertise]
    );
    
    // Calculate ranges
    const low = Math.round(finalPrice * 0.8);
    const high = Math.round(finalPrice * 1.3);
    
    setPricing({
      recommended: finalPrice,
      range: { low, high },
      hourly: Math.round(finalPrice / 160), // Assuming 160 hours/month
      factors: {
        scope,
        risk,
        timeline,
        expertise
      }
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Pricing Heuristic</h3>
          <p className="text-sm text-gray-400 mt-1">Calculate project pricing based on key factors</p>
        </div>
        <Badge variant="primary">{credits} credits</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="small">Small (1-2 features)</option>
            <option value="medium">Medium (3-5 features)</option>
            <option value="large">Large (Full product)</option>
            <option value="enterprise">Enterprise (Complex system)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Risk Level</label>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="low">Low (Clear requirements)</option>
            <option value="medium">Medium (Some unknowns)</option>
            <option value="high">High (Many unknowns)</option>
            <option value="critical">Critical (Mission critical)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Timeline</label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="relaxed">Relaxed (3+ months)</option>
            <option value="normal">Normal (1-3 months)</option>
            <option value="rush">Rush (2-4 weeks)</option>
            <option value="emergency">Emergency (<2 weeks)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Expertise Required</label>
          <select
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="junior">Junior (Learning curve OK)</option>
            <option value="intermediate">Intermediate (Some experience)</option>
            <option value="senior">Senior (Deep expertise)</option>
            <option value="expert">Expert (Top 1% skills)</option>
          </select>
        </div>
      </div>

      <PremiumButton onClick={calculate}>
        Calculate Pricing
      </PremiumButton>

      {/* Results */}
      <AnimatePresence>
        {pricing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/[0.08]">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-2">Recommended Price</p>
                <p className="text-4xl font-bold text-white">${pricing.recommended.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Range: ${pricing.range.low.toLocaleString()} - ${pricing.range.high.toLocaleString()}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white/[0.03] rounded-lg">
                  <p className="text-gray-400">Hourly equivalent</p>
                  <p className="text-white font-medium">${pricing.hourly}/hour</p>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-lg">
                  <p className="text-gray-400">Monthly retainer</p>
                  <p className="text-white font-medium">${Math.round(pricing.recommended / 3).toLocaleString()}/mo</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// Brief Forge Tool - Transform 4 answers into crisp brief
export const BriefForge = ({ credits, onUse }) => {
  const [answers, setAnswers] = useState({
    problem: '',
    solution: '',
    timeline: '',
    success: ''
  });
  const [brief, setBrief] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateBrief = () => {
    if (!answers.problem || !answers.solution || !answers.timeline || !answers.success) {
      return;
    }
    
    setGenerating(true);
    onUse?.();
    
    // Generate structured brief
    setTimeout(() => {
      const generatedBrief = {
        executive: `This project addresses ${answers.problem.toLowerCase()} through ${answers.solution.toLowerCase()}, to be completed within ${answers.timeline.toLowerCase()}, with success defined as ${answers.success.toLowerCase()}.`,
        
        sections: [
          {
            title: 'Problem Statement',
            content: answers.problem,
            priority: 'Critical'
          },
          {
            title: 'Proposed Solution',
            content: answers.solution,
            priority: 'High'
          },
          {
            title: 'Timeline & Milestones',
            content: `Target completion: ${answers.timeline}`,
            priority: 'High'
          },
          {
            title: 'Success Criteria',
            content: answers.success,
            priority: 'Critical'
          },
          {
            title: 'Key Assumptions',
            content: 'Resources are available, stakeholders are aligned, no major blockers exist',
            priority: 'Medium'
          },
          {
            title: 'Risks & Mitigations',
            content: 'Timeline risk: Buffer built in. Scope risk: MVP defined. Technical risk: Proven stack.',
            priority: 'Medium'
          },
          {
            title: 'Next Steps',
            content: '1. Approve brief\n2. Allocate resources\n3. Kick-off meeting\n4. Begin implementation',
            priority: 'High'
          },
          {
            title: 'Stakeholders',
            content: 'Product owner, Development team, Design lead, Business stakeholder',
            priority: 'Medium'
          },
          {
            title: 'Budget Estimate',
            content: 'To be determined based on resource allocation and timeline',
            priority: 'Medium'
          },
          {
            title: 'Delivery Commitment',
            content: `Deliver working solution that ${answers.success.toLowerCase()} within ${answers.timeline}`,
            priority: 'Critical'
          }
        ],
        
        formatted: null // Will be generated below
      };
      
      // Generate 10-line formatted brief
      generatedBrief.formatted = generatedBrief.sections
        .map((section, i) => `${i + 1}. ${section.title}: ${section.content}`)
        .join('\n');
      
      setBrief(generatedBrief);
      setGenerating(false);
    }, 1000);
  };

  const copyBrief = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Brief Forge</h3>
          <p className="text-sm text-gray-400 mt-1">4 answers → 10-line crisp brief</p>
        </div>
        <Badge variant="primary">{credits} credits</Badge>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            1. What problem are you solving?
          </label>
          <textarea
            value={answers.problem}
            onChange={(e) => setAnswers({ ...answers, problem: e.target.value })}
            className="w-full h-20 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="The main challenge or opportunity..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            2. What's your proposed solution?
          </label>
          <textarea
            value={answers.solution}
            onChange={(e) => setAnswers({ ...answers, solution: e.target.value })}
            className="w-full h-20 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="How you plan to address it..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            3. What's your timeline?
          </label>
          <input
            type="text"
            value={answers.timeline}
            onChange={(e) => setAnswers({ ...answers, timeline: e.target.value })}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="e.g., 30 days, Q1 2024, 6 weeks..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            4. How will you measure success?
          </label>
          <textarea
            value={answers.success}
            onChange={(e) => setAnswers({ ...answers, success: e.target.value })}
            className="w-full h-20 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Key metrics or outcomes..."
          />
        </div>
      </div>

      <PremiumButton 
        onClick={generateBrief} 
        loading={generating}
        disabled={!answers.problem || !answers.solution || !answers.timeline || !answers.success}
      >
        Forge Brief
      </PremiumButton>

      {/* Generated Brief */}
      <AnimatePresence>
        {brief && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Executive Summary */}
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-400">Executive Summary</h4>
                <button
                  onClick={() => copyBrief(brief.executive)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-white leading-relaxed">
                {brief.executive}
              </p>
            </div>
            
            {/* 10-Line Brief */}
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400">10-Line Brief</h4>
                <button
                  onClick={() => copyBrief(brief.formatted)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Copy All
                </button>
              </div>
              <div className="space-y-2">
                {brief.sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-xs text-gray-500 mt-0.5">{i + 1}.</span>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-gray-300">{section.title}:</span>
                      <span className="text-xs text-gray-400 ml-2">{section.content}</span>
                    </div>
                    <Badge 
                      variant={
                        section.priority === 'Critical' ? 'danger' : 
                        section.priority === 'High' ? 'warning' : 
                        'default'
                      }
                      className="text-xs"
                    >
                      {section.priority}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Export Options */}
            <div className="flex gap-3">
              <PremiumButton 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  const blob = new Blob([brief.formatted], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `brief-${Date.now()}.txt`;
                  a.click();
                }}
              >
                Download TXT
              </PremiumButton>
              <PremiumButton 
                variant="secondary" 
                size="sm"
                onClick={() => copyBrief(brief.formatted)}
              >
                Copy to Clipboard
              </PremiumButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default {
  UTMMemory,
  NoteToThread,
  HeadlineLinearify,
  PricingHeuristic,
  BriefForge
};
