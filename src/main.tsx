import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Andika: font napravljen za djecu koja uče čitati (slova "a" i "g" kao u pisanim slovima).
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-ext-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/andika/latin-ext-700.css'
import '@fontsource/andika/cyrillic-400.css'
import '@fontsource/andika/cyrillic-700.css'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
