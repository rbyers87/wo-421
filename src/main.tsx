import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Detect if the app is running in standalone mode (PWA) and apply dark mode if needed
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (isStandalone) {
  // Apply the `dark` class if the system prefers dark mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }

  // Listen for system theme changes and update the `dark` class accordingly
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
}

// Render the React app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// service worker logs

if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  
  navigator.serviceWorker.ready.then(registration => {
    console.log('Service Worker Registered:', registration);
  }).catch(error => {
    console.error('Service Worker Registration Error:', error);
  });
}
