import React from 'react';
import { Link } from 'react-router-dom';

const Advisory = () => {
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

  return (
    <div className="py-16">
      <div className="container max-w-6xl">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="heading-1 mb-6">Advisory</h1>
          <p className="text-h3 text-muted-foreground max-w-3xl mx-auto">
            How to work with me. Pick the pressure you want. Outcomes only.
          </p>
        </section>

        {/* Services */}
        <section className="py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="surface p-8 hover:-translate-y-px transition-all duration-160"
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
                    <button className="w-full btn-primary mb-3">
                      Book Sparring Session
                    </button>
                    <p className="text-small text-muted-foreground text-center">
                      Pay securely with Stripe
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-surface/50 -mx-6 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-12">How it works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-semibold mb-4 mx-auto">
                  1
                </div>
                <h3 className="heading-3 mb-4">Initial Brief</h3>
                <p className="body-text text-muted-foreground">
                  Tell me the problem, timeline, and constraints. I reply within 24h with fit assessment.
                </p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-semibold mb-4 mx-auto">
                  2
                </div>
                <h3 className="heading-3 mb-4">Execution</h3>
                <p className="body-text text-muted-foreground">
                  Focused work period with regular check-ins. No meetings for meeting's sake.
                </p>
              </div>
              
              <div>
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-semibold mb-4 mx-auto">
                  3
                </div>
                <h3 className="heading-3 mb-4">Delivery</h3>
                <p className="body-text text-muted-foreground">
                  Concrete outputs on deadline. Implementation guidance included.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <h2 className="heading-2 mb-6">Ready to start?</h2>
          <p className="text-h3 text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tell me who you are, the problem in one paragraph, your timeline, and budget range.
          </p>
          <Link to="/contact" className="btn-primary text-lg px-8 py-4">
            Start an engagement
          </Link>
        </section>

        {/* Guarantee */}
        <section className="py-12 text-center border-t border-border">
          <p className="body-text text-muted-foreground">
            If you're not satisfied with the output, I'll refund 100% of your payment. No questions asked.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Advisory;
