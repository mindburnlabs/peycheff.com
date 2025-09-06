import React from 'react';

const Work = () => {
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

  return (
    <div className="py-16">
      <div className="container max-w-5xl">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="heading-1 mb-6">Work</h1>
          <p className="text-h3 text-muted-foreground max-w-3xl mx-auto">
            Four proof-of-execution snapshots. Context → System → Result. No filler.
          </p>
        </section>

        {/* Project Cards */}
        <section className="py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div 
                key={index} 
                className="surface p-8 hover:-translate-y-px transition-all duration-160"
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
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <p className="text-h3 text-muted-foreground mb-8">
            Interested in working together?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/advisory" className="btn-primary">
              View advisory services
            </a>
            <a href="/contact" className="btn-secondary">
              Start a conversation
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Work;
