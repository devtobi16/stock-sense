import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installPerformanceDiagnostics } from './lib/performanceDiagnostics'
import { SpeedInsights } from '@vercel/speed-insights/react'

installPerformanceDiagnostics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights beforeSend={event => {
      const url = new URL(event.url);
      url.search = ''; url.hash = '';
      return { ...event, url: url.toString() };
    }} />
  </StrictMode>,
)
