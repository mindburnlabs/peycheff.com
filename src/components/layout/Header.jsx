import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/work', label: 'Work' },
    { path: '/notes', label: 'Notes' },
    { path: '/advisory', label: 'Advisory' },
    { path: '/contact', label: 'Contact' },
  ];
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[20px] backdrop-saturate-[130%] bg-background/75">
      <div className="max-w-container mx-auto px-6">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-[18px] font-semibold -tracking-[0.01em] hover:opacity-70 transition-opacity duration-120"
          >
            peycheff
          </Link>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[16px] font-medium transition-opacity duration-120 hover:opacity-70 ${
                  isActive(item.path) 
                    ? 'text-accent' 
                    : 'text-foreground'
                }`}
              >
                {item.label}
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
