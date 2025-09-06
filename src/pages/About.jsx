import React from 'react';

const About = () => {
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

  return (
    <div className="px-6 py-32">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <section className="pb-20">
          <h1 className="text-h1 mb-12 leading-[1.1] max-w-3xl">
            Founder & systems designer focused on compressing idea→product cycles.
          </h1>
          
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <p className="text-[20px] leading-[1.6] text-muted-foreground mb-12">
                I build compact systems that turn ideas into products fast. Clear scope, tiny teams, and instrumentation keep us honest. Elegant doesn't mean complex—it means useful, durable, and easy to run.
              </p>
              
              {/* Reality stripe - inline, not boxed */}
              <p className="text-[20px] leading-[1.6] font-medium mb-12">
                In 2022 I lost ~a million, went through a divorce, and got covid. I kept shipping. Scar tissue beats theory.
              </p>
            </div>
          </div>
        </section>

        {/* Brain section */}
        <section className="py-20 border-t border-border">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[24px] font-semibold leading-[1.3]">
                How my brain helps
              </h2>
            </div>
            <div className="lg:col-span-9">
              <p className="text-[18px] leading-[1.6] text-muted-foreground">
                ADHD → deep hyperfocus sprints, fast pattern recognition, ruthless simplification. My work cadence reflects that.
              </p>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-20 border-t border-border">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[24px] font-semibold leading-[1.3]">
                Principles
              </h2>
            </div>
            <div className="lg:col-span-9">
              <div className="flex flex-wrap gap-8">
                <span className="text-[18px] font-medium">Ship fast</span>
                <span className="text-[18px] font-medium">Instrument reality</span>
                <span className="text-[18px] font-medium">Teach in public</span>
                <span className="text-[18px] font-medium">Avoid buzzwords</span>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 border-t border-border">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[24px] font-semibold leading-[1.3] sticky top-32">
                Timeline
                <span className="block text-[16px] font-normal text-muted-foreground mt-1">bet → outcome</span>
              </h2>
            </div>
            <div className="lg:col-span-9 space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className="group">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="lg:flex-1">
                      <p className="text-[18px] leading-[1.6]">{item.bet}</p>
                    </div>
                    <div className="text-accent text-[18px] lg:px-4">→</div>
                    <div className="lg:flex-1">
                      <p className="text-[18px] leading-[1.6] font-medium">{item.outcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="py-20 border-t border-border text-center">
          <p className="text-[14px] text-muted-foreground">
            Ivan Peychev (peycheff is the brand/domain)
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
