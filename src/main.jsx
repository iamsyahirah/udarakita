import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AppPreferencesProvider } from './contexts/AppPreferences.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(<AppPreferencesProvider><App /></AppPreferencesProvider>)
