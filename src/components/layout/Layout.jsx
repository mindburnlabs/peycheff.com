import React, { useState } from 'react';
import Header from './Header';
import NowBar from './NowBar';
import Footer from './Footer';
import CommandPalette from '../CommandPalette';
import Toast from '../Toast';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const Layout = ({ children }) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Initialize keyboard shortcuts with command palette integration
  useKeyboardShortcuts(() => setShowCommandPalette(true));
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <NowBar />
      
      {/* Main content with proper spacing for fixed header */}
      <main className="pt-[73px]">
        {children}
      </main>
      
      <Footer />
      
      {/* Global UX Components */}
      <CommandPalette 
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
      <Toast />
    </div>
  );
};

export default Layout;
