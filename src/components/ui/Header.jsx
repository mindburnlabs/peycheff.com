import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { label: 'Home', path: '/home-landing' },
    { label: 'About', path: '/about-profile' },
    { label: 'Work', path: '/work-portfolio' },
    { label: 'Notes', path: '/notes-content-hub' },
    { label: 'Advisory', path: '/advisory-services' },
    { label: 'Contact', path: '/contact-inquiry' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Now Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C0F]/95 blur-translucent border-b hairline-border">
        <div className="apple-container py-3">
          <div className="text-center">
            <span className="inline-flex items-center gap-3">
              <div className="w-2 h-2 bg-[#34D399] rounded-full animate-pulse"></div>
              <span className="text-[#F2F3F5] text-sm font-medium">
                Building Mindburn Labs, writing two operator notes, and taking two build sprints this month.
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`apple-header fixed top-[48px] left-0 right-0 z-40 apple-motion ${
        isScrolled 
          ? 'bg-[#0B0C0F]/80 blur-translucent' 
          : 'bg-[#0B0C0F]/80 blur-translucent'
      }`}>
        <div className="apple-container h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo/Wordmark */}
            <Link 
              to="/home-landing" 
              className="text-[#F2F3F5] text-lg font-semibold hover:text-[#A5ABB3] apple-motion focus-visible-accent"
              onClick={closeMobileMenu}
            >
              peycheff
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`text-sm font-medium apple-motion focus-visible-accent ${
                    isActiveRoute(item?.path)
                      ? 'text-[#F2F3F5]' 
                      : 'text-[#A5ABB3] hover:text-[#F2F3F5]'
                  }`}
                >
                  {item?.label}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link 
                to="/advisory-services" 
                className="apple-button focus-visible-accent"
              >
                Work with me
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-[#F2F3F5] hover:bg-[#A5ABB3]/10 apple-motion focus-visible-accent"
              aria-label="Toggle mobile menu"
            >
              <Icon 
                name={isMobileMenuOpen ? "X" : "Menu"} 
                size={24} 
              />
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t hairline-border bg-[#0B0C0F]/95 blur-translucent">
              <nav className="px-0 py-6 space-y-2">
                {navigationItems?.map((item) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    onClick={closeMobileMenu}
                    className={`block px-0 py-3 font-medium apple-motion focus-visible-accent ${
                      isActiveRoute(item?.path)
                        ? 'text-[#F2F3F5]' 
                        : 'text-[#A5ABB3] hover:text-[#F2F3F5]'
                    }`}
                  >
                    {item?.label}
                  </Link>
                ))}
                <div className="pt-4 border-t hairline-border">
                  <Link 
                    to="/advisory-services" 
                    onClick={closeMobileMenu}
                    className="apple-button w-full justify-center focus-visible-accent"
                  >
                    Work with me
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;