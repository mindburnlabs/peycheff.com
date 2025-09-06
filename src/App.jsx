import React, { useEffect } from "react";
import { HelmetProvider } from 'react-helmet-async';
import Routes from "./Routes";
import { initGA } from "./lib/analytics";

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  return (
    <HelmetProvider>
      <Routes />
    </HelmetProvider>
  );
}

export default App;
