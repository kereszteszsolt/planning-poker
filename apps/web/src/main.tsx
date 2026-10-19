import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { appInfo } from './shared/app-info';
document.title = appInfo.appName;
if (appInfo.favicon) {
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.head.appendChild(document.createElement('link'));
  icon.rel = 'icon'; icon.href = appInfo.favicon;
} else { document.querySelector('link[rel="icon"]')?.remove(); }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
