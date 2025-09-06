import React from 'react';
import Icon from '../../../components/AppIcon';

const ExperienceTimeline = () => {
  const experiences = [
    {
      id: 1,
      period: "2022 - Present",
      role: "Independent Systems Design Consultant",
      company: "Self-Employed",
      type: "Consulting",
      description: "Advising startups and scale-ups on systems architecture, team building, and product strategy. Helping founders make technical decisions that support long-term growth.",
      achievements: [
        "Guided 15+ startups through critical scaling decisions",
        "Designed systems supporting 10M+ monthly active users",
        "Established engineering practices reducing deployment time by 75%",
        "Built design systems adopted by teams of 50+ engineers"
      ],
      technologies: ["React", "Node.js", "AWS", "Kubernetes", "PostgreSQL"]
    },
    {
      id: 2,
      period: "2019 - 2022",
      role: "VP of Engineering",
      company: "TechFlow Solutions",
      type: "Leadership",
      description: "Led engineering organization through Series A to Series B, scaling team from 8 to 45 engineers while maintaining product velocity and code quality.",
      achievements: [
        "Scaled engineering team 5x while improving delivery metrics",
        "Reduced system downtime from 2.1% to 0.05%",
        "Implemented microservices architecture supporting 100x traffic growth",
        "Established technical hiring process with 92% offer acceptance rate"
      ],
      technologies: ["Python", "React", "Docker", "Redis", "MongoDB"]
    },
    {
      id: 3,
      period: "2016 - 2019",
      role: "Senior Full-Stack Engineer",
      company: "DataSync Inc",
      type: "Engineering",
      description: "Core contributor to platform serving enterprise clients, focusing on real-time data processing and user interface optimization.",
      achievements: [
        "Built real-time analytics dashboard processing 1M+ events/hour",
        "Optimized database queries reducing response time by 60%",
        "Led frontend architecture migration to modern React patterns",
        "Mentored 8 junior engineers in full-stack development"
      ],
      technologies: ["JavaScript", "Python", "React", "PostgreSQL", "Redis"]
    },
    {
      id: 4,
      period: "2013 - 2016",
      role: "Frontend Developer",
      company: "Creative Digital Agency",
      type: "Development",
      description: "Developed responsive web applications for diverse clients, specializing in performance optimization and user experience design.",
      achievements: [
        "Delivered 25+ client projects with 98% satisfaction rate",
        "Improved average page load time by 45% across all projects",
        "Established component library used across 50+ projects",
        "Led transition from jQuery to modern JavaScript frameworks"
      ],
      technologies: ["HTML5", "CSS3", "JavaScript", "jQuery", "Sass"]
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Consulting': return 'Users';
      case 'Leadership': return 'Crown';
      case 'Engineering': return 'Code';
      case 'Development': return 'Monitor';
      default: return 'Briefcase';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Consulting': return 'text-accent';
      case 'Leadership': return 'text-warning';
      case 'Engineering': return 'text-success';
      case 'Development': return 'text-blue-400';
      default: return 'text-text-secondary';
    }
  };

  return (
    <section id="experience" className="py-16 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Professional Journey
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Over 12 years of building products, leading teams, and solving complex 
              technical challenges across startups and established companies.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block"></div>

            <div className="space-y-12">
              {experiences?.map((exp, index) => (
                <div key={exp?.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 bg-accent rounded-full border-4 border-background hidden md:block"></div>
                  
                  <div className="md:ml-20">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center ${getTypeColor(exp?.type)}`}>
                              <Icon name={getTypeIcon(exp?.type)} size={16} />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">
                                {exp?.role}
                              </h3>
                              <p className="text-accent font-medium">
                                {exp?.company}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Calendar" size={16} />
                          <span className="text-sm font-medium">{exp?.period}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-text-secondary leading-relaxed">
                        {exp?.description}
                      </p>

                      {/* Achievements */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                          Key Achievements
                        </h4>
                        <ul className="space-y-2">
                          {exp?.achievements?.map((achievement, achievementIndex) => (
                            <li key={achievementIndex} className="flex items-start space-x-3">
                              <Icon name="CheckCircle" size={16} color="var(--color-accent)" className="mt-0.5 flex-shrink-0" />
                              <span className="text-text-secondary text-sm">
                                {achievement}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                          Technologies Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {exp?.technologies?.map((tech, techIndex) => (
                            <span 
                              key={techIndex}
                              className="px-3 py-1 bg-surface text-text-secondary text-sm rounded-full border border-border"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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

export default ExperienceTimeline;