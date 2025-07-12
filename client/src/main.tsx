import React from "react"
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handlers to prevent crashes
window.addEventListener('error', (e) => {
  if (e.message.includes('Must pass an API key')) {
    e.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('Must pass an API key')) {
    e.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
