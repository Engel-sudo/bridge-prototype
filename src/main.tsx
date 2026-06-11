import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import { initTheme } from './theme'
import App from './App'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
