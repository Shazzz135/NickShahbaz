import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Canonical domain enforcement: if accessed via default Vercel deployment alias, forward to primary domain
if (typeof window !== 'undefined' && window.location.hostname === 'nick-shahbaz-shazzzs-projects.vercel.app') {
  window.location.replace(`https://nickshahbaz.ca${window.location.pathname}${window.location.search}${window.location.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
