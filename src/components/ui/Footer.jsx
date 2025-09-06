import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const Footer = () => {
  const navigationItems = [
    { label: 'Home', path: '/home-landing' },
    { label: 'About', path: '/about-profile' },
    { label: 'Work', path: '/work-portfolio' },
    { label: 'Notes', path: '/notes-content-hub' },
    { label: 'Advisory', path: '/advisory-services' },
    { label: 'Contact', path: '/contact-inquiry' }
  ];

  const socialLinks = [
    { 
      name: 'LinkedIn', 
      icon: 'Linkedin', 
      url: 'https://linkedin.com/in/ivanpeychev',
      label: 'Connect on LinkedIn'
    },
    { 
      name: 'Twitter', 
      icon: 'Twitter', 
      url: 'https://twitter.com/ivanpeychev',
      label: 'Follow on Twitter'
    },
    { 
      name: 'GitHub', 
      icon: 'Github', 
      url: 'https://github.com/ivanpeychev',
      label: 'View GitHub profile'
    },
    { 
      name: 'Email', 
      icon: 'Mail', 
      url: 'mailto:ivan@peychev.com',
      label: 'Send email'
    }
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section - Enhanced */}
          <div className="md:col-span-2 space-y-6">
            <Link 
              to="/home-landing" 
              className="flex items-center space-x-3 group transition-all duration-300 ease-out hover:scale-105 w-fit"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-shadow duration-300">
                  <span className="text-white font-bold text-xl">IP</span>
                </div>
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 animate-ping transition-opacity duration-300"></div>
              </div>
              <span className="text-white font-bold text-2xl group-hover:gradient-text transition-all duration-300">
                Ivan Peychev
              </span>
            </Link>
            <p className="text-zinc-400 leading-relaxed max-w-md text-lg">
              Systems design expert and startup advisor helping founders build 
              <span className="text-white font-semibold"> scalable, user-centered products</span> that drive business growth.
            </p>
            
            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="glass-effect rounded-xl p-4 hover-lift">
                <div className="text-2xl font-bold gradient-text text-glow">50+</div>
                <div className="text-zinc-500 text-sm font-medium">Projects Delivered</div>
              </div>
              <div className="glass-effect rounded-xl p-4 hover-lift">
                <div className="text-2xl font-bold gradient-text text-glow">98%</div>
                <div className="text-zinc-500 text-sm font-medium">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Navigation Links - Enhanced */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">
              Navigation
            </h3>
            <nav className="grid grid-cols-1 gap-3">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className="text-zinc-400 hover:text-white text-base transition-all duration-300 ease-out hover:translate-x-1 flex items-center space-x-2 group"
                >
                  <Icon name="ArrowRight" size={14} className="text-zinc-600 group-hover:text-indigo-400 transition-colors duration-300" />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Social - Enhanced */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">
              Connect
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-zinc-400">
                <div className="glass-effect rounded-lg p-2">
                  <Icon name="MapPin" size={16} className="text-indigo-400" />
                </div>
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center space-x-3 text-zinc-400">
                <div className="glass-effect rounded-lg p-2">
                  <div className="relative">
                    <Icon name="Clock" size={16} className="text-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <span>Available for consulting</span>
              </div>
            </div>
            
            {/* Social Links - Enhanced */}
            <div className="space-y-4">
              <h4 className="text-zinc-300 font-medium text-sm uppercase tracking-wider">Follow Me</h4>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks?.map((social) => (
                  <a
                    key={social?.name}
                    href={social?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-effect rounded-xl p-4 text-zinc-400 hover:text-white transition-all duration-300 ease-out hover-lift group"
                    aria-label={social?.label}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={social?.icon} size={18} className="group-hover:text-indigo-400 transition-colors duration-300" />
                      <span className="text-sm font-medium">{social?.name}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Enhanced */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-zinc-500">
              © 2025 Ivan Peychev. All rights reserved.
            </p>
            <div className="hidden sm:flex items-center space-x-2 text-zinc-600">
              <span>Made with</span>
              <Icon name="Heart" size={14} className="text-red-500 animate-pulse" />
              <span>in San Francisco</span>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              to="/privacy" 
              className="text-zinc-500 hover:text-white transition-colors duration-300 ease-out text-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-zinc-500 hover:text-white transition-colors duration-300 ease-out text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;