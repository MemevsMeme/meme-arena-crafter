
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root with strict mode removed to prevent double mounting which can cause navigation issues
createRoot(document.getElementById("root")!).render(<App />);
