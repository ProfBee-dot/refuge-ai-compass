import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PWAProvider } from './contexts/PWAContext'

createRoot(document.getElementById("root")!).render(
    <PWAProvider>
        <App />
    </PWAProvider>
);



if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
  }