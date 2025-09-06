import React, { useState, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ProjectCard from './components/ProjectCard';
import ProjectFilters from './components/ProjectFilters';
import ProjectModal from './components/ProjectModal';
import CapabilitiesMatrix from './components/CapabilitiesMatrix';
import ClientTestimonials from './components/ClientTestimonials';
import { WorkWithMeCTA } from '../../components/ui/CTAButton';
import Icon from '../../components/AppIcon';

const WorkPortfolio = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    industry: [],
    technology: []
  });

  // Mock project data
  const projects = [
    {
      id: 1,
      title: "E-commerce Platform Redesign",
      client: "RetailTech Pro",
      category: "Full-Stack Development",
      industry: "E-commerce",
      description: "Complete platform overhaul focusing on performance optimization and user experience improvements. Implemented microservices architecture and modern React frontend.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
      technologies: ["React", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker"],
      outcomes: [
        "75% improvement in page load times",
        "40% increase in conversion rates",
        "99.9% uptime achieved",
        "Reduced infrastructure costs by 30%"
      ],
      year: "2024",
      featured: true,
      duration: "6 months",
      teamSize: "5 developers",
      challenge: "The existing platform was struggling with performance issues, frequent downtime, and poor user experience. The monolithic architecture made it difficult to scale and maintain.",
      solution: "Implemented a microservices architecture with React frontend, optimized database queries, introduced caching layers, and established comprehensive monitoring and alerting systems.",
      results: "The redesigned platform now handles 10x more traffic with improved performance metrics and significantly better user satisfaction scores.",
      externalUrl: "https://retailtech-demo.com"
    },
    {
      id: 2,
      title: "FinTech MVP Development",
      client: "DataVault Inc",
      category: "MVP Development",
      industry: "Financial Services",
      description: "Built a secure financial data aggregation platform from scratch, focusing on compliance, security, and scalability for Series A funding.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      technologies: ["Next.js", "Python", "MongoDB", "Stripe", "Auth0", "Kubernetes"],
      outcomes: [
        "Successfully raised $5M Series A",
        "SOC 2 compliance achieved",
        "10,000+ active users in 3 months",
        "Zero security incidents"
      ],
      year: "2024",
      featured: true,
      duration: "4 months",
      teamSize: "3 developers",
      challenge: "Building a secure, compliant financial platform that could handle sensitive data while providing excellent user experience and meeting regulatory requirements.",
      solution: "Designed a secure architecture with end-to-end encryption, implemented comprehensive audit logging, and built a scalable API infrastructure with proper authentication and authorization.",
      results: "The MVP successfully attracted investors and users, leading to Series A funding and rapid user growth while maintaining perfect security record."
    },
    {
      id: 3,
      title: "Healthcare Data Analytics",
      client: "MedTech Solutions",
      category: "Data Engineering",
      industry: "Healthcare",
      description: "Developed a real-time analytics platform for processing and visualizing healthcare data with HIPAA compliance and advanced reporting capabilities.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop",
      technologies: ["React", "Python", "Apache Kafka", "Elasticsearch", "Docker", "Terraform"],
      outcomes: [
        "Processed 1M+ records daily",
        "HIPAA compliance certified",
        "50% reduction in reporting time",
        "Real-time insights delivery"
      ],
      year: "2023",
      featured: false,
      duration: "8 months",
      teamSize: "6 developers",
      challenge: "Processing large volumes of sensitive healthcare data while maintaining strict compliance requirements and providing real-time analytics capabilities.",
      solution: "Built a robust data pipeline using Apache Kafka for real-time processing, implemented comprehensive data encryption and access controls, and created intuitive dashboards for healthcare professionals.",
      results: "The platform now processes millions of healthcare records daily while maintaining perfect compliance and providing actionable insights to medical professionals."
    },
    {
      id: 4,
      title: "SaaS Platform Migration",
      client: "CloudFirst Technologies",
      category: "Cloud Migration",
      industry: "Software",
      description: "Migrated legacy on-premise SaaS platform to cloud-native architecture with improved scalability, security, and cost efficiency.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
      technologies: ["Vue.js", "Go", "PostgreSQL", "AWS", "Terraform", "Jenkins"],
      outcomes: [
        "60% reduction in infrastructure costs",
        "99.99% uptime achieved",
        "5x improvement in deployment speed",
        "Zero-downtime migration completed"
      ],
      year: "2023",
      featured: false,
      duration: "5 months",
      teamSize: "4 developers",
      challenge: "Migrating a complex legacy system to the cloud without disrupting existing customers while improving performance and reducing costs.",
      solution: "Implemented a phased migration approach with comprehensive testing, built cloud-native replacements for legacy components, and established robust CI/CD pipelines.",
      results: "Successfully migrated the entire platform with zero downtime, significantly improved performance metrics, and reduced operational costs."
    },
    {
      id: 5,
      title: "Mobile App Backend API",
      client: "FitnessTrack Pro",
      category: "API Development",
      industry: "Health & Fitness",
      description: "Built scalable REST API and real-time features for fitness tracking mobile application with social features and data analytics.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
      technologies: ["Node.js", "Express", "MongoDB", "Socket.io", "Redis", "AWS"],
      outcomes: [
        "Support for 100K+ concurrent users",
        "Sub-100ms API response times",
        "Real-time social features",
        "Advanced analytics dashboard"
      ],
      year: "2023",
      featured: false,
      duration: "3 months",
      teamSize: "2 developers",
      challenge: "Building a high-performance API that could handle real-time features, social interactions, and complex fitness data analytics for a growing mobile app.",
      solution: "Designed a scalable API architecture with efficient database schemas, implemented real-time features using WebSockets, and built comprehensive analytics capabilities.",
      results: "The API now supports over 100,000 concurrent users with excellent performance metrics and provides rich social and analytics features."
    },
    {
      id: 6,
      title: "EdTech Learning Platform",
      client: "EduInnovate",
      category: "Full-Stack Development",
      industry: "Education",
      description: "Developed comprehensive online learning platform with video streaming, interactive assessments, and progress tracking for educational institutions.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
      technologies: ["React", "Django", "PostgreSQL", "AWS S3", "WebRTC", "Stripe"],
      outcomes: [
        "50,000+ students enrolled",
        "95% course completion rate",
        "Seamless video streaming",
        "Integrated payment processing"
      ],
      year: "2022",
      featured: false,
      duration: "7 months",
      teamSize: "5 developers",
      challenge: "Creating an engaging online learning experience with reliable video streaming, interactive content, and comprehensive progress tracking.",
      solution: "Built a modern learning management system with optimized video delivery, interactive assessment tools, and detailed analytics for both students and instructors.",
      results: "The platform successfully serves thousands of students with high engagement rates and has become a key revenue driver for educational institutions."
    }
  ];

  // Extract filter options from projects
  const filterOptions = useMemo(() => {
    const categories = [...new Set(projects.map(p => p.category))];
    const industries = [...new Set(projects.map(p => p.industry))];
    const technologies = [...new Set(projects.flatMap(p => p.technologies))];

    return {
      categories: categories?.sort(),
      industries: industries?.sort(),
      technologies: technologies?.sort()
    };
  }, [projects]);

  // Filter projects based on active filters
  const filteredProjects = useMemo(() => {
    return projects?.filter(project => {
      const categoryMatch = activeFilters?.category?.length === 0 || 
        activeFilters?.category?.includes(project?.category);
      
      const industryMatch = activeFilters?.industry?.length === 0 || 
        activeFilters?.industry?.includes(project?.industry);
      
      const technologyMatch = activeFilters?.technology?.length === 0 || 
        activeFilters?.technology?.some(tech => project?.technologies?.includes(tech));

      return categoryMatch && industryMatch && technologyMatch;
    });
  }, [projects, activeFilters]);

  // Separate featured and regular projects
  const featuredProjects = filteredProjects?.filter(p => p?.featured);
  const regularProjects = filteredProjects?.filter(p => !p?.featured);

  const handleFilterChange = (category, values) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: values
    }));
  };

  const handleClearFilters = () => {
    setActiveFilters({
      category: [],
      industry: [],
      technology: []
    });
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Systems Design & Development
                <span className="block text-accent">Portfolio</span>
              </h1>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Explore detailed case studies showcasing scalable systems, successful product launches, 
                and measurable business impact across diverse industries and technical challenges.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-text-secondary">
              <div className="flex items-center space-x-2">
                <Icon name="Briefcase" size={16} className="text-accent" />
                <span>50+ Projects Delivered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-accent" />
                <span>30+ Happy Clients</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Award" size={16} className="text-accent" />
                <span>8+ Years Experience</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <ProjectFilters
              filters={filterOptions}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              projectCount={filteredProjects?.length}
            />
          </div>
        </section>

        {/* Featured Projects */}
        {featuredProjects?.length > 0 && (
          <section className="py-8 px-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Featured Case Studies</h2>
                <p className="text-text-secondary">
                  In-depth looks at complex projects with detailed outcomes and technical insights
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredProjects?.map((project) => (
                  <ProjectCard
                    key={project?.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Projects */}
        {regularProjects?.length > 0 && (
          <section className="py-8 px-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">All Projects</h2>
                <p className="text-text-secondary">
                  Complete portfolio of client work and technical achievements
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularProjects?.map((project) => (
                  <ProjectCard
                    key={project?.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredProjects?.length === 0 && (
          <section className="py-16 px-6">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <Icon name="Search" size={48} className="text-text-secondary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
              <p className="text-text-secondary">
                Try adjusting your filters to see more projects, or{' '}
                <button
                  onClick={handleClearFilters}
                  className="text-accent hover:text-accent/80 transition-colors duration-150 ease-out"
                >
                  clear all filters
                </button>
                {' '}to view the complete portfolio.
              </p>
            </div>
          </section>
        )}

        {/* Capabilities Matrix */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <CapabilitiesMatrix />
          </div>
        </section>

        {/* Client Testimonials */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <ClientTestimonials />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed">
                Let's discuss how I can help you design and build scalable systems 
                that drive your business forward. From MVP development to enterprise 
                architecture, I'm here to turn your vision into reality.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <WorkWithMeCTA size="lg" />
              <a
                href="/advisory-services"
                className="text-accent hover:text-accent/80 transition-colors duration-150 ease-out font-medium flex items-center space-x-2"
              >
                <span>Learn about advisory services</span>
                <Icon name="ArrowRight" size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default WorkPortfolio;