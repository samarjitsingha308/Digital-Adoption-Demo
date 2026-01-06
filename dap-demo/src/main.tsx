import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DapProvider } from './dap/DapProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DapProvider>
      <App />
    </DapProvider>
  </StrictMode>,
)
