import React from 'react';
import Header from './Header';
import NowBar from './NowBar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <NowBar />
      
      {/* Main content with proper spacing for fixed header */}
      <main className="pt-[73px]">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
