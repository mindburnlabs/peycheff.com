import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { WorkWithMeCTA } from '../../components/ui/CTAButton';
import ServiceCard from './components/ServiceCard';
import ProcessStep from './components/ProcessStep';
import ExpertiseArea from './components/ExpertiseArea';
import TestimonialCard from './components/TestimonialCard';
import ConsultationBooking from './components/ConsultationBooking';
import FAQSection from './components/FAQSection';

const AdvisoryServices = () => {
  // Mock data for services
  const advisoryServices = [
    {
      icon: "Settings",
      title: "Systems Design Consultation",
      description: "Comprehensive analysis and optimization of your technical architecture, focusing on scalability, performance, and maintainability for long-term growth.",
      duration: "2-4 weeks",
      outcomes: [
        "Scalable system architecture blueprint",
        "Performance optimization roadmap",
        "Technical debt reduction strategy",
        "Implementation timeline and milestones"
      ],
      isPopular: true
    },
    {
      icon: "Users",
      title: "Founder Coaching",
      description: "One-on-one mentorship for founders navigating technical decisions, team scaling, and strategic product development challenges.",
      duration: "Ongoing",
      outcomes: [
        "Enhanced technical leadership skills",
        "Strategic decision-making framework",
        "Team building and scaling strategies",
        "Product development best practices"
      ]
    },
    {
      icon: "Target",
      title: "Strategic Planning",
      description: "End-to-end strategic planning for product development, market positioning, and business growth through systematic approaches.",
      duration: "4-6 weeks",
      outcomes: [
        "Comprehensive business strategy",
        "Market positioning framework",
        "Product roadmap and priorities",
        "Growth metrics and KPIs"
      ]
    },
    {
      icon: "Zap",
      title: "Product Strategy",
      description: "Product-focused advisory covering user experience design, feature prioritization, and market-fit optimization strategies.",
      duration: "3-5 weeks",
      outcomes: [
        "User-centered product strategy",
        "Feature prioritization matrix",
        "Market validation framework",
        "UX optimization recommendations"
      ]
    },
    {
      icon: "TrendingUp",
      title: "Team Scaling",
      description: "Guidance on building high-performing technical teams, establishing processes, and creating sustainable growth cultures.",
      duration: "2-3 months",
      outcomes: [
        "Hiring and onboarding processes",
        "Team structure optimization",
        "Performance management systems",
        "Culture and retention strategies"
      ]
    },
    {
      icon: "Lightbulb",
      title: "Innovation Workshops",
      description: "Facilitated workshops for ideation, problem-solving, and strategic thinking with your team to unlock creative solutions.",
      duration: "1-2 weeks",
      outcomes: [
        "Innovation methodology framework",
        "Creative problem-solving techniques",
        "Team collaboration improvement",
        "Actionable innovation pipeline"
      ]
    }
  ];

  // Mock data for process steps
  const processSteps = [
    {
      step: 1,
      icon: "MessageCircle",
      title: "Initial Consultation",
      description: "We start with a comprehensive discussion about your challenges, goals, and current situation to understand your specific needs and determine the best approach."
    },
    {
      step: 2,
      icon: "Search",
      title: "Assessment & Analysis",
      description: "Deep dive into your systems, processes, and team dynamics. I analyze your current state and identify opportunities for improvement and optimization."
    },
    {
      step: 3,
      icon: "FileText",
      title: "Strategic Recommendations",
      description: "Receive detailed, actionable recommendations with clear implementation steps, timelines, and expected outcomes tailored to your specific situation."
    },
    {
      step: 4,
      icon: "Cog",
      title: "Implementation Support",
      description: "Ongoing guidance and support during implementation, including regular check-ins, progress reviews, and adjustments as needed to ensure success."
    }
  ];

  // Mock data for expertise areas
  const expertiseAreas = [
    {
      icon: "Code",
      title: "Technical Architecture",
      description: "Designing scalable, maintainable systems that grow with your business needs and handle increasing complexity.",
      skills: ["Microservices", "API Design", "Database Architecture", "Cloud Infrastructure"]
    },
    {
      icon: "Users",
      title: "Team Leadership",
      description: "Building and leading high-performing technical teams through effective processes and cultural development.",
      skills: ["Team Building", "Process Design", "Performance Management", "Culture Development"]
    },
    {
      icon: "BarChart3",
      title: "Business Strategy",
      description: "Aligning technical decisions with business objectives to drive sustainable growth and competitive advantage.",
      skills: ["Strategic Planning", "Market Analysis", "Product Strategy", "Growth Metrics"]
    },
    {
      icon: "Rocket",
      title: "Startup Scaling",
      description: "Navigating the unique challenges of startup growth, from MVP to scale, with proven frameworks and strategies.",
      skills: ["MVP Development", "Product-Market Fit", "Scaling Strategies", "Funding Preparation"]
    }
  ];

  // Mock data for testimonials
  const testimonials = [
    {
      quote: "Ivan\'s strategic guidance transformed our approach to systems design. His insights helped us scale from 10K to 100K users without major architectural changes.",
      author: "Sarah Chen",
      role: "CTO",
      company: "TechFlow",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "The founder coaching sessions were invaluable. Ivan helped me navigate complex technical decisions and build a world-class engineering team.",
      author: "Marcus Rodriguez",
      role: "Founder & CEO",
      company: "DataSync",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "Ivan\'s strategic planning process gave us clarity on our product roadmap and helped us secure Series A funding. His expertise is unmatched.",
      author: "Emily Watson",
      role: "Co-founder",
      company: "CloudVision",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5
    }
  ];

  const handleServiceLearnMore = (serviceTitle) => {
    // Scroll to consultation booking section
    document.getElementById('consultation-booking')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <>
      <Helmet>
        <title>Advisory Services - Ivan Peychev | Systems Design & Startup Strategy</title>
        <meta name="description" content="Expert advisory services for founders and technical leaders. Systems design consultation, strategic planning, and team scaling guidance from experienced startup advisor Ivan Peychev." />
        <meta property="og:title" content="Advisory Services - Ivan Peychev" />
        <meta property="og:description" content="Transform your startup with expert advisory services in systems design, strategic planning, and team scaling." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                    Strategic Advisory for
                    <span className="text-accent block">Growing Startups</span>
                  </h1>
                  <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto">
                    Transform your startup with expert guidance in systems design, strategic planning, and team scaling. 
                    Get the insights you need to build scalable, successful products.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => document.getElementById('consultation-booking')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Book Consultation
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    View Services
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-16 bg-surface">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Advisory Services
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Comprehensive advisory services designed to accelerate your startup's growth 
                  through strategic systems design and proven methodologies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advisoryServices?.map((service, index) => (
                  <ServiceCard
                    key={index}
                    icon={service?.icon}
                    title={service?.title}
                    description={service?.description}
                    duration={service?.duration}
                    outcomes={service?.outcomes}
                    isPopular={service?.isPopular}
                    onLearnMore={() => handleServiceLearnMore(service?.title)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                      How Advisory Works
                    </h2>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      A structured approach to understanding your challenges and delivering 
                      actionable solutions that drive real business results.
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-lg p-6 border border-border">
                    <div className="flex items-center space-x-3 mb-4">
                      <Icon name="Clock" size={20} color="var(--color-accent)" />
                      <span className="text-foreground font-medium">Typical Timeline</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      Most advisory engagements span 2-12 weeks depending on scope and complexity. 
                      Strategic consultations can be completed in 2-4 weeks, while comprehensive 
                      system redesigns typically take 2-3 months with ongoing support.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {processSteps?.map((step, index) => (
                    <ProcessStep
                      key={index}
                      step={step?.step}
                      icon={step?.icon}
                      title={step?.title}
                      description={step?.description}
                      isLast={index === processSteps?.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Expertise Areas */}
          <section className="py-16 bg-surface">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Areas of Expertise
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Deep expertise across the full spectrum of startup challenges, 
                  from technical architecture to business strategy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {expertiseAreas?.map((area, index) => (
                  <ExpertiseArea
                    key={index}
                    icon={area?.icon}
                    title={area?.title}
                    description={area?.description}
                    skills={area?.skills}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Client Success Stories
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Hear from founders and technical leaders who have transformed 
                  their businesses through strategic advisory partnerships.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials?.map((testimonial, index) => (
                  <TestimonialCard
                    key={index}
                    quote={testimonial?.quote}
                    author={testimonial?.author}
                    role={testimonial?.role}
                    company={testimonial?.company}
                    avatar={testimonial?.avatar}
                    rating={testimonial?.rating}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Consultation Booking */}
          <section id="consultation-booking" className="py-16 bg-surface">
            <div className="max-w-4xl mx-auto px-6">
              <ConsultationBooking />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-6">
              <FAQSection />
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-surface">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Ready to Accelerate Your Growth?
                  </h2>
                  <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
                    Let's discuss how strategic advisory can help you build scalable systems, 
                    optimize your team, and achieve your business objectives faster.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <WorkWithMeCTA size="lg" />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open('mailto:ivan@peychev.com', '_blank')}
                    className="border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdvisoryServices;