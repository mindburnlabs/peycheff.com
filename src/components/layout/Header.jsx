import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { addHoverPrefetch } from '../../utils/prefetch';

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const linkRefs = useRef({});
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/work', label: 'Work' },
    { path: '/notes', label: 'Notes' },
    { path: '/products', label: 'Products' },
    { path: '/advisory', label: 'Advisory' },
    { path: '/contact', label: 'Contact' },
  ];
  
  // Track scroll position for adaptive styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set up hover prefetching for navigation links
  useEffect(() => {
    const cleanupFunctions = [];
    
    navItems.forEach(item => {
      const linkElement = linkRefs.current[item.path];
      if (linkElement) {
        const cleanup = addHoverPrefetch(linkElement, item.path);
        cleanupFunctions.push(cleanup);
      }
    });
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
      isScrolled 
        ? 'backdrop-blur-[24px] backdrop-saturate-[140%] bg-background/85 shadow-sm' 
        : 'backdrop-blur-[20px] backdrop-saturate-[130%] bg-background/75'
    }`}>
      <div className="max-w-container mx-auto px-6">
        <nav className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-14' : 'h-16'
        }`}>
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-all duration-200 hover:scale-[1.02]"
          >
            <img 
              src="/assets/images/avatar.jpg" 
              alt="Ivan Peychev" 
              className={`rounded-full object-cover ring-1 ring-border transition-all duration-200 group-hover:ring-2 group-hover:ring-accent/20 ${
                isScrolled ? 'w-7 h-7' : 'w-8 h-8'
              }`}
            />
            <span className="text-[18px] font-semibold -tracking-[0.01em] group-hover:text-accent transition-colors duration-200">
              peycheff
            </span>
          </Link>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                ref={(el) => { linkRefs.current[item.path] = el; }}
                to={item.path}
                className={`relative text-[16px] font-medium transition-all duration-200 group ${
                  isActive(item.path) 
                    ? 'text-accent' 
                    : 'text-foreground hover:text-accent/80'
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {/* Active indicator */}
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
                )}
                {/* Hover effect */}
                <div className="absolute inset-0 -m-2 rounded-lg bg-accent/0 group-hover:bg-accent/5 transition-colors duration-200" />
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button - minimal */}
          <button className="md:hidden p-2 -mr-2 hover:opacity-70 transition-opacity duration-120">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
              <rect width="18" height="2" rx="1"/>
              <rect y="5" width="18" height="2" rx="1"/>
              <rect y="10" width="18" height="2" rx="1"/>
            </svg>
          </button>
        </nav>
      </div>
      
      {/* Hairline border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border"/>
    </header>
  );
};

export default Header;
