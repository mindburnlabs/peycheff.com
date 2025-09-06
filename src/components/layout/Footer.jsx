import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend
    console.log('Subscribe:', email);
  };
  
  return (
    <footer className="border-t border-border">
      <div className="max-w-container mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          {/* Contact links */}
          <div className="flex flex-wrap items-center gap-6 text-[16px]">
            <a 
              href="mailto:ivan@peycheff.com" 
              className="text-accent hover:opacity-70 transition-opacity duration-120"
            >
              ivan@peycheff.com
            </a>
            <span className="text-border hidden sm:block">·</span>
            <a 
              href="https://x.com/ivanitrust" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:opacity-70 transition-opacity duration-120"
            >
              X @ivanitrust
            </a>
            <a 
              href="https://instagram.com/ivanitrust" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:opacity-70 transition-opacity duration-120"
            >
              IG @ivanitrust
            </a>
          </div>
          
          {/* Subscribe */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSubscribe} className="flex items-center gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder-muted-foreground min-w-[200px]"
                required
              />
              <button
                type="submit"
                className="bg-accent text-white px-6 py-3 text-[16px] font-medium rounded-lg hover:-translate-y-0.5 transition-transform duration-120"
              >
                Subscribe
              </button>
            </form>
            <a 
              href="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-120 text-[16px]"
            >
              Privacy
            </a>
          </div>
        </div>
        
        {/* Bottom note */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-[14px] text-muted-foreground text-center">
            Ivan Peychev (peycheff is the brand/domain)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
