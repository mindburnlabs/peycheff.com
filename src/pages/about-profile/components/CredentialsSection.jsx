import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CredentialsSection = () => {
  const certifications = [
    {
      id: 1,
      title: "AWS Solutions Architect Professional",
      issuer: "Amazon Web Services",
      year: "2023",
      icon: "Award"
    },
    {
      id: 2,
      title: "Certified Kubernetes Administrator",
      issuer: "Cloud Native Computing Foundation",
      year: "2022",
      icon: "Shield"
    },
    {
      id: 3,
      title: "Google Cloud Professional Architect",
      issuer: "Google Cloud",
      year: "2021",
      icon: "Cloud"
    }
  ];

  const clientLogos = [
    {
      id: 1,
      name: "TechFlow Solutions",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop"
    },
    {
      id: 2,
      name: "DataSync Inc",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop"
    },
    {
      id: 3,
      name: "Creative Digital",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop"
    },
    {
      id: 4,
      name: "StartupX",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop"
    },
    {
      id: 5,
      name: "ScaleUp Co",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop"
    },
    {
      id: 6,
      name: "InnovateLab",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop"
    }
  ];

  const achievements = [
    {
      id: 1,
      metric: "50+",
      label: "Projects Delivered",
      description: "Successful product launches and system implementations"
    },
    {
      id: 2,
      metric: "15+",
      label: "Startups Advised",
      description: "Companies guided through critical scaling decisions"
    },
    {
      id: 3,
      metric: "100M+",
      label: "Users Served",
      description: "Cumulative users across all systems built"
    },
    {
      id: 4,
      metric: "12",
      label: "Years Experience",
      description: "Building products and leading engineering teams"
    }
  ];

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-16">
          {/* Achievements */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Track Record
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Numbers that reflect the impact of systems thinking and 
                user-centered design across diverse projects and organizations.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements?.map((achievement) => (
                <div 
                  key={achievement?.id}
                  className="text-center space-y-2 p-6 bg-card border border-border rounded-lg"
                >
                  <div className="text-3xl lg:text-4xl font-bold text-accent">
                    {achievement?.metric}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {achievement?.label}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {achievement?.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Certifications
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Continuous learning and validation of expertise in cloud architecture, 
                systems design, and modern development practices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certifications?.map((cert) => (
                <div 
                  key={cert?.id}
                  className="flex items-center space-x-4 p-6 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors duration-150 ease-out"
                >
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={cert?.icon} size={24} color="var(--color-accent)" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground text-sm">
                      {cert?.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {cert?.issuer}
                    </p>
                    <p className="text-accent text-xs font-medium">
                      {cert?.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Logos */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Trusted By
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Organizations that have relied on my expertise to build scalable 
                systems and drive product success.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {clientLogos?.map((client) => (
                <div 
                  key={client?.id}
                  className="flex items-center justify-center p-4 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors duration-150 ease-out grayscale hover:grayscale-0"
                >
                  <Image
                    src={client?.logo}
                    alt={`${client?.name} logo`}
                    className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-150 ease-out"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CredentialsSection;