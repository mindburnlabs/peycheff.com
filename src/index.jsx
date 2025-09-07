import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/apple-effects.css";
import { trackEvent } from './lib/analytics';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

// Passive visit beacon to feed daily_metrics visitors_count (client-side GA already fires)
try {
  trackEvent('visit', { page: window.location.pathname });
} catch (e) {}
