
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console logging for auth debugging
console.info('💜 Initializing MemeVsMeme application...')

createRoot(document.getElementById("root")!).render(<App />);
