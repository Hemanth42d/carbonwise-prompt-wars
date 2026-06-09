/**
 * EcoSphere AI — Application Entry Point
 * Initializes React with StrictMode for development best practices.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './App.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html has a div with id="root".');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
