import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Advisory = () => {
  const reducedMotion = useReducedMotion();
  
  const services = [
    {
      title: "Sparring Session (90 min)",
      description: "For founders/operators who need ruthless clarity.",
      output: "a 1-page plan within 24h.",
      price: "$500",
      duration: "90 minutes",
      ideal: "Quick strategic direction, decision validation, or breaking through analysis paralysis."
    },
    {
      title: "Systems Audit (10 days)",
      description: "For teams stuck in noise.",
      output: "redesigned cadence, instrumentation, dashboards, and measurable deltas.",
      price: "$5,000",
      duration: "10 days",
      ideal: "Teams with good people but poor processes, unclear metrics, or coordination overhead."
    },
    {
      title: "Build Sprint (30 days)",
      description: "For people who want a product, not a deck.",
      output: "a usable v1 shipped with a tiny team and a rollout doc.",
      price: "$25,000",
      duration: "30 days",
      ideal: "Validated ideas that need rapid execution with clear scope and tight deadlines."
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
            Advisory
          </motion.h1>
          <motion.p 
            className="text-h3 text-muted-foreground max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            How to work with me. Pick the pressure you want. Outcomes only.
          </motion.p>
        </motion.section>

        {/* Services */}
        <motion.section 
          className="py-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                className="surface p-8 hover:-translate-y-px transition-all duration-160"
                variants={fadeInUp}
                whileHover={reducedMotion ? {} : { y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="heading-2 mb-4">{service.title}</h2>
                  <p className="text-accent text-h3 font-medium mb-2">{service.price}</p>
                  <p className="small-text text-muted-foreground">{service.duration}</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="body-text text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                  
                  <div>
                    <p className="small-text text-accent font-medium mb-2">Output:</p>
                    <p className="body-text font-medium">{service.output}</p>
                  </div>
                  
                  <div>
                    <p className="small-text text-accent font-medium mb-2">Ideal for:</p>
                    <p className="small-text text-muted-foreground leading-relaxed">
                      {service.ideal}
                    </p>
                  </div>
                </div>

                {/* Stripe integration for Sparring Session */}
                {index === 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <motion.button 
                      className="w-full btn-primary mb-3"
                      whileHover={reducedMotion ? {} : { scale: 1.02 }}
                      whileTap={reducedMotion ? {} : { scale: 0.98 }}
                    >
                      Book Sparring Session
                    </motion.button>
                    <p className="text-small text-muted-foreground text-center">
                      Pay securely with Stripe
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Process */}
        <motion.section 
          className="py-20 bg-surface/50 -mx-6 px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="heading-2 mb-12"
              variants={fadeInUp}
            >
              How it works
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Initial Brief",
                  description: "Tell me the problem, timeline, and constraints. I reply within 24h with fit assessment."
                },
                {
                  step: "2", 
                  title: "Execution",
                  description: "Focused work period with regular check-ins. No meetings for meeting's sake."
                },
                {
                  step: "3",
                  title: "Delivery", 
                  description: "Concrete outputs on deadline. Implementation guidance included."
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  whileHover={reducedMotion ? {} : { y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-semibold mb-4 mx-auto"
                    whileHover={reducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="heading-3 mb-4">{item.title}</h3>
                  <p className="body-text text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          className="py-20 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="heading-2 mb-6"
            variants={fadeInUp}
          >
            Ready to start?
          </motion.h2>
          <motion.p 
            className="text-h3 text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Tell me who you are, the problem in one paragraph, your timeline, and budget range.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link 
              to="/contact" 
              className="btn-primary text-lg px-8 py-4"
            >
              Start an engagement
            </Link>
          </motion.div>
        </motion.section>

        {/* Guarantee */}
        <motion.section 
          className="py-12 text-center border-t border-border"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <p className="body-text text-muted-foreground">
            If you're not satisfied with the output, I'll refund 100% of your payment. No questions asked.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default Advisory;
