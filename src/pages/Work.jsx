import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Work = () => {
  const reducedMotion = useReducedMotion();
  
  const projects = [
    {
      title: "Generative NFT launch (2021)",
      context: "crowded category; execution wins.",
      system: "lean art pipeline, drop mechanics, community ops.",
      result: "sold out in ~30 minutes."
    },
    {
      title: "Personal ops automations",
      context: "solo founder overhead everywhere.",
      system: "scripts/agents for intake, outreach, publishing.",
      result: "hours/week reclaimed; steadier publish cadence."
    },
    {
      title: "Telegram micro-automations",
      context: "creators needed distribution without headcount.",
      system: "capture → drip → human handoff; guardrails to avoid spam.",
      result: "higher reply rates; cleaner pipeline hygiene."
    },
    {
      title: "AI utilities (active)",
      context: "build tools people actually use.",
      system: "30-day sprints, tiny teams, opinionated UX.",
      result: "first utilities live; expanding user tests.",
      hasLink: true
    }
  ];

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
            Work
          </motion.h1>
          <motion.p 
            className="text-h3 text-muted-foreground max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Four proof-of-execution snapshots. Context → System → Result. No filler.
          </motion.p>
        </motion.section>

        {/* Project Cards */}
        <motion.section 
          className="py-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div 
                key={index} 
                className="surface p-8 hover:-translate-y-px transition-all duration-160"
                variants={fadeInUp}
                whileHover={reducedMotion ? {} : { y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="heading-2 mb-6">{project.title}</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="small-text text-accent font-medium mb-2">Context:</p>
                    <p className="body-text">{project.context}</p>
                  </div>
                  
                  <div>
                    <p className="small-text text-accent font-medium mb-2">System:</p>
                    <p className="body-text">{project.system}</p>
                  </div>
                  
                  <div>
                    <p className="small-text text-accent font-medium mb-2">Result:</p>
                    <p className="body-text font-medium">{project.result}</p>
                  </div>
                </div>
                
                {project.hasLink && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <a href="/notes" className="link text-small">
                      Optional link to case notes in /notes →
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          className="py-16 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <motion.p 
            className="text-h3 text-muted-foreground mb-8"
            variants={fadeInUp}
          >
            Interested in working together?
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={staggerChildren}
          >
            <motion.a 
              href="/advisory" 
              className="btn-primary"
              variants={fadeInUp}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
            >
              View advisory services
            </motion.a>
            <motion.a 
              href="/contact" 
              className="btn-secondary"
              variants={fadeInUp}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
            >
              Start a conversation
            </motion.a>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Work;
