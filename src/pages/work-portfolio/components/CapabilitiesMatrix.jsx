import React from 'react';
import Icon from '../../../components/AppIcon';

const CapabilitiesMatrix = () => {
  const capabilities = [
    {
      category: "Systems Design",
      skills: [
        { name: "Architecture Planning", level: 95, icon: "Building" },
        { name: "Scalability Design", level: 92, icon: "TrendingUp" },
        { name: "Performance Optimization", level: 88, icon: "Zap" },
        { name: "Database Design", level: 90, icon: "Database" }
      ]
    },
    {
      category: "Frontend Development",
      skills: [
        { name: "React/Next.js", level: 94, icon: "Code" },
        { name: "TypeScript", level: 89, icon: "FileCode" },
        { name: "UI/UX Implementation", level: 87, icon: "Palette" },
        { name: "Performance Tuning", level: 91, icon: "Gauge" }
      ]
    },
    {
      category: "Backend Development",
      skills: [
        { name: "Node.js/Python", level: 93, icon: "Server" },
        { name: "API Design", level: 96, icon: "Globe" },
        { name: "Microservices", level: 85, icon: "Network" },
        { name: "Cloud Architecture", level: 88, icon: "Cloud" }
      ]
    },
    {
      category: "Business Strategy",
      skills: [
        { name: "Product Strategy", level: 92, icon: "Target" },
        { name: "Technical Leadership", level: 89, icon: "Users" },
        { name: "Startup Advisory", level: 94, icon: "Lightbulb" },
        { name: "Growth Planning", level: 87, icon: "BarChart3" }
      ]
    }
  ];

  const getSkillColor = (level) => {
    if (level >= 90) return 'text-accent';
    if (level >= 80) return 'text-success';
    return 'text-warning';
  };

  const getSkillBgColor = (level) => {
    if (level >= 90) return 'bg-accent';
    if (level >= 80) return 'bg-success';
    return 'bg-warning';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-foreground font-semibold text-2xl">Technical Capabilities</h2>
        <p className="text-text-secondary">
          Core competencies developed through 8+ years of building scalable systems
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {capabilities?.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h3 className="text-foreground font-semibold text-lg flex items-center space-x-2">
              <span>{category?.category}</span>
            </h3>
            
            <div className="space-y-4">
              {category?.skills?.map((skill, skillIndex) => (
                <div key={skillIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={skill?.icon} 
                        size={16} 
                        className={getSkillColor(skill?.level)}
                      />
                      <span className="text-foreground font-medium text-sm">
                        {skill?.name}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getSkillColor(skill?.level)}`}>
                      {skill?.level}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-surface rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${getSkillBgColor(skill?.level)}`}
                      style={{ width: `${skill?.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Methodology Section */}
      <div className="pt-6 border-t border-border space-y-4">
        <h3 className="text-foreground font-semibold text-lg">Methodologies & Frameworks</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Agile/Scrum", icon: "RefreshCw" },
            { name: "Design Thinking", icon: "Lightbulb" },
            { name: "Lean Startup", icon: "TrendingUp" },
            { name: "DevOps", icon: "GitBranch" },
            { name: "Test-Driven Development", icon: "CheckCircle" },
            { name: "Continuous Integration", icon: "Repeat" },
            { name: "User-Centered Design", icon: "Users" },
            { name: "Data-Driven Decisions", icon: "BarChart3" }
          ]?.map((method, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 bg-surface rounded-lg hover:bg-muted transition-colors duration-150 ease-out"
            >
              <Icon name={method?.icon} size={16} className="text-accent" />
              <span className="text-text-secondary text-sm">{method?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapabilitiesMatrix;