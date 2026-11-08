import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register the offline shell. It is scoped to /dhyaana/ so it never
// intercepts the rest of the site.
//
// In dev, /dhyaana/sw.js does not exist (the dev server falls back to the
// SPA index), so the browser would try to run HTML as a worker script.
// Registration is therefore limited to production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/dhyaana/sw.js', { scope: '/dhyaana/' }).catch(() => {
      // Offline support is a progressive enhancement; the app works without it.
    })
  })
}
