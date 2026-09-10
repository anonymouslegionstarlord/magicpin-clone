import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const storedTheme = localStorage.getItem(
  'magicpin-theme'
)

const initialTheme =
  storedTheme === 'dark' ||
  (!storedTheme &&
    window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches)
    ? 'dark'
    : 'light'

document.documentElement.classList.toggle(
  'dark',
  initialTheme === 'dark'
)

document.documentElement.dataset.theme = initialTheme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
