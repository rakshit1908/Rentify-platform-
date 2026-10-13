import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles — must be first
import './styles/index.css';

import App from './App.jsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('[Rentify] Root element #root not found in index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
