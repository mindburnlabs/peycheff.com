import React from 'react';
import Icon from '../../../components/AppIcon';

const ValuesSection = () => {
  const values = [
    {
      id: 1,
      icon: "Target",
      title: "User-Centered Thinking",
      description: "Every technical decision should ultimately serve the people using the product. I believe in building systems that are not just technically excellent but genuinely useful and delightful."
    },
    {
      id: 2,
      icon: "Zap",
      title: "Pragmatic Innovation",
      description: "The best solutions balance cutting-edge technology with practical constraints. I focus on innovations that solve real problems rather than pursuing technology for its own sake."
    },
    {
      id: 3,
      icon: "Shield",
      title: "Sustainable Growth",
      description: "Building for the long term means creating systems that can evolve, teams that can scale, and practices that remain effective as organizations grow."
    },
    {
      id: 4,
      icon: "Heart",
      title: "Empathetic Leadership",
      description: "Great products come from great teams. I believe in leading with empathy, fostering psychological safety, and helping every team member reach their potential."
    }
  ];

  const personalInterests = [
    {
      icon: "BookOpen",
      title: "Continuous Learning",
      description: "Reading about systems thinking, behavioral psychology, and emerging technologies"
    },
    {
      icon: "Users",
      title: "Mentoring",
      description: "Helping early-career engineers develop both technical and leadership skills"
    },
    {
      icon: "Mountain",
      title: "Outdoor Adventures",
      description: "Hiking and rock climbing to maintain perspective and mental clarity"
    },
    {
      icon: "Coffee",
      title: "Coffee Culture",
      description: "Exploring specialty coffee and the craft behind exceptional experiences"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-16">
          {/* Values */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Core Values
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                The principles that guide my approach to building products, 
                leading teams, and solving complex problems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values?.map((value) => (
                <div 
                  key={value?.id}
                  className="space-y-4 p-6 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors duration-150 ease-out"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <Icon name={value?.icon} size={20} color="var(--color-accent)" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {value?.title}
                    </h3>
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    {value?.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Interests */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Beyond Work
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                The activities and interests that keep me inspired, grounded, 
                and continuously growing as both a professional and person.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {personalInterests?.map((interest, index) => (
                <div 
                  key={index}
                  className="text-center space-y-4 p-6 bg-surface border border-border rounded-lg hover:bg-card transition-colors duration-150 ease-out"
                >
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto">
                    <Icon name={interest?.icon} size={24} color="var(--color-accent)" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {interest?.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {interest?.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;