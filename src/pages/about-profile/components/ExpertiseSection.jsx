import React from 'react';
import Icon from '../../../components/AppIcon';

const ExpertiseSection = () => {
  const expertiseAreas = [
    {
      id: 1,
      icon: "Layers",
      title: "Systems Architecture",
      description: "Designing scalable, maintainable systems that grow with your business needs and user demands.",
      skills: ["Microservices", "API Design", "Database Architecture", "Performance Optimization"]
    },
    {
      id: 2,
      icon: "Users",
      title: "Team Leadership",
      description: "Building and scaling engineering teams that deliver consistently while maintaining high code quality.",
      skills: ["Engineering Management", "Hiring & Onboarding", "Process Design", "Culture Building"]
    },
    {
      id: 3,
      icon: "Palette",
      title: "Product Design",
      description: "Creating user-centered designs that balance business goals with exceptional user experiences.",
      skills: ["Design Systems", "User Research", "Prototyping", "Accessibility"]
    },
    {
      id: 4,
      icon: "TrendingUp",
      title: "Startup Strategy",
      description: "Guiding founders through technical decisions that impact product-market fit and scalability.",
      skills: ["Technical Due Diligence", "MVP Planning", "Growth Architecture", "Risk Assessment"]
    },
    {
      id: 5,
      icon: "Code",
      title: "Full-Stack Development",
      description: "Hands-on development across the entire stack with focus on modern, performant technologies.",
      skills: ["React/Next.js", "Node.js", "Python", "Cloud Infrastructure"]
    },
    {
      id: 6,
      icon: "MessageSquare",
      title: "Technical Communication",
      description: "Translating complex technical concepts into clear, actionable insights for stakeholders.",
      skills: ["Technical Writing", "Stakeholder Alignment", "Documentation", "Knowledge Transfer"]
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Areas of Expertise
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Deep technical knowledge combined with strategic thinking to solve 
              complex problems and drive business outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseAreas?.map((area) => (
              <div 
                key={area?.id}
                className="bg-card border border-border rounded-lg p-6 space-y-4 hover:border-accent/50 transition-colors duration-150 ease-out"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Icon name={area?.icon} size={20} color="var(--color-accent)" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {area?.title}
                  </h3>
                </div>

                <p className="text-text-secondary leading-relaxed">
                  {area?.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Key Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {area?.skills?.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-surface text-text-secondary text-xs rounded-md border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;