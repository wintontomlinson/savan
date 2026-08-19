import{StrictMode}from'react';
import{createRoot}from'react-dom/client';
import'./index.css';
import App from'./App';

// PWA install prompt — capture for later use in Settings
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);
