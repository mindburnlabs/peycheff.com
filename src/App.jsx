import React, { useEffect } from "react";
import { HelmetProvider } from 'react-helmet-async';
import Routes from "./Routes";
import { initGA } from "./lib/analytics";
import { initPrefetching } from "./utils/prefetch";

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
    
    // Initialize prefetching
    initPrefetching();
  }, []);

  return (
    <HelmetProvider>
      <Routes />
    </HelmetProvider>
  );
}

export default App;
