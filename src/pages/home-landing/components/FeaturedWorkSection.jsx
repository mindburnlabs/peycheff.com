import React from 'react';
import { ViewWorkCTA } from '../../../components/ui/CTAButton';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const FeaturedWorkSection = () => {
  const featuredProjects = [
    {
      id: 1,
      title: "FinTech Platform Redesign",
      description: "Complete UX overhaul for a Series B fintech startup, resulting in 40% increase in user engagement and 25% reduction in support tickets.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
      category: "Product Design",
      metrics: {
        engagement: "+40%",
        conversion: "+25%"
      }
    },
    {
      id: 2,
      title: "E-commerce Scaling Architecture",
      description: "Designed scalable microservices architecture for high-growth e-commerce platform handling 10M+ monthly transactions.",
      image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?w=600&h=400&fit=crop",
      technologies: ["Kubernetes", "GraphQL", "Redis", "MongoDB"],
      category: "Systems Architecture",
      metrics: {
        performance: "+60%",
        uptime: "99.9%"
      }
    },
    {
      id: 3,
      title: "AI-Powered Analytics Dashboard",
      description: "Built comprehensive analytics platform with ML-driven insights for SaaS companies to optimize their product metrics.",
      image: "https://images.pixabay.com/photo/2016/11/27/21/42/stock-1863880_1280.jpg?w=600&h=400&fit=crop",
      technologies: ["Python", "TensorFlow", "D3.js", "Docker"],
      category: "Data Platform",
      metrics: {
        insights: "+80%",
        decisions: "+35%"
      }
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header - Enhanced */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center space-x-2 glass-effect rounded-full px-4 py-2 mb-4">
            <Icon name="Briefcase" size={16} className="text-indigo-400" />
            <span className="text-zinc-400 text-sm font-medium tracking-wide">Portfolio</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Featured <span className="gradient-text">Work</span>
          </h2>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Real results from real partnerships. Here's how I've helped founders 
            build products that <span className="text-white font-semibold">scale and succeed</span>.
          </p>
        </div>

        {/* Projects Grid - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {featuredProjects?.map((project, index) => (
            <div 
              key={project?.id}
              className="group relative modern-card rounded-2xl overflow-hidden hover-lift glow-effect"
              style={{animationDelay: `${0.2 * index}s`}}
            >
              {/* Project Image - Enhanced */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project?.image}
                  alt={project?.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                    {project?.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="glass-effect rounded-full p-2">
                    <Icon name="ExternalLink" size={16} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Project Content - Enhanced */}
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-white group-hover:gradient-text transition-all duration-300 ease-out">
                  {project?.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {project?.description}
                </p>

                {/* Metrics - Enhanced */}
                <div className="flex items-center space-x-6 py-4">
                  {Object.entries(project?.metrics)?.map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold gradient-text text-glow">{value}</div>
                      <div className="text-zinc-500 text-sm capitalize font-medium tracking-wide">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Technologies - Enhanced */}
                <div className="flex flex-wrap gap-2">
                  {project?.technologies?.map((tech) => (
                    <span 
                      key={tech}
                      className="glass-effect text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 hover:border-indigo-500/50 transition-colors duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* View Details Link - Enhanced */}
                <div className="pt-4">
                  <button className="group/btn flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-all duration-300 ease-out">
                    <span className="font-semibold">View case study</span>
                    <Icon name="ArrowRight" size={16} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA - Enhanced */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-xl opacity-20 blur"></div>
            <ViewWorkCTA size="lg" className="relative" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorkSection;