import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const About = () => {
  const reducedMotion = useReducedMotion();
  
  const timeline = [
    {
      bet: "Built a generative NFT collection",
      outcome: "sold out in ~30 minutes"
    },
    {
      bet: "Prototyped a micro-automation stack",
      outcome: "cut weekly ops hours meaningfully"
    },
    {
      bet: "Standardized a 30-day launch motion",
      outcome: "repeatable v1s on cadence"
    },
    {
      bet: "Deployed Telegram sales micro-bots",
      outcome: "higher reply rates & cleaner handoffs"
    },
    {
      bet: "Started building AI utilities",
      outcome: "shipping useful tools, not demos"
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
        {/* Hero */}
        <motion.section 
          className="pb-20"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.h1 
            className="text-h1 mb-12 leading-[1.1] max-w-3xl"
            variants={fadeInUp}
          >
            Founder & systems designer focused on compressing idea→product cycles.
          </motion.h1>
          
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <motion.p 
                className="text-[20px] leading-[1.6] text-muted-foreground mb-12"
                variants={fadeInUp}
              >
                I build compact systems that turn ideas into products fast. Clear scope, tiny teams, and instrumentation keep us honest. Elegant doesn't mean complex—it means useful, durable, and easy to run.
              </motion.p>
              
              {/* Reality stripe - inline, not boxed */}
              <motion.p 
                className="text-[20px] leading-[1.6] font-medium mb-12"
                variants={fadeInUp}
              >
                In 2022 I lost ~a million, went through a divorce, and got covid. I kept shipping. Scar tissue beats theory.
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* Brain section */}
        <motion.section 
          className="py-20 border-t border-border"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <motion.h2 
                className="text-[24px] font-semibold leading-[1.3]"
                variants={fadeInUp}
              >
                How my brain helps
              </motion.h2>
            </div>
            <div className="lg:col-span-9">
              <motion.p 
                className="text-[18px] leading-[1.6] text-muted-foreground"
                variants={fadeInUp}
              >
                ADHD → deep hyperfocus sprints, fast pattern recognition, ruthless simplification. My work cadence reflects that.
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* Principles */}
        <motion.section 
          className="py-20 border-t border-border"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <motion.h2 
                className="text-[24px] font-semibold leading-[1.3]"
                variants={fadeInUp}
              >
                Principles
              </motion.h2>
            </div>
            <div className="lg:col-span-9">
              <motion.div 
                className="flex flex-wrap gap-8"
                variants={staggerChildren}
              >
                {["Ship fast", "Instrument reality", "Teach in public", "Avoid buzzwords"].map((principle, index) => (
                  <motion.span 
                    key={principle}
                    className="text-[18px] font-medium"
                    variants={fadeInUp}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {principle}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section 
          className="py-20 border-t border-border"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <motion.h2 
                className="text-[24px] font-semibold leading-[1.3] sticky top-32"
                variants={fadeInUp}
              >
                Timeline
                <span className="block text-[16px] font-normal text-muted-foreground mt-1">bet → outcome</span>
              </motion.h2>
            </div>
            <div className="lg:col-span-9 space-y-12">
              {timeline.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="group"
                  variants={fadeInUp}
                  whileHover={reducedMotion ? {} : { x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="lg:flex-1">
                      <p className="text-[18px] leading-[1.6]">{item.bet}</p>
                    </div>
                    <div className="text-accent text-[18px] lg:px-4">→</div>
                    <div className="lg:flex-1">
                      <p className="text-[18px] leading-[1.6] font-medium">{item.outcome}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Footer note */}
        <motion.section 
          className="py-20 border-t border-border text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <p className="text-[14px] text-muted-foreground">
            Ivan Peychev (peycheff is the brand/domain)
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
