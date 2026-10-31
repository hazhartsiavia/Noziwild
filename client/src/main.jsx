import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider, redirectToPreferredLanguage } from './i18n/LanguageContext.jsx'
import { TripProvider } from './context/TripContext.jsx'
import { SitePhotosProvider } from './sitePhotos.jsx'

redirectToPreferredLanguage()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LanguageProvider>
      <SitePhotosProvider>
        <AuthProvider>
          <TripProvider>
            <App />
          </TripProvider>
        </AuthProvider>
      </SitePhotosProvider>
    </LanguageProvider>
  </BrowserRouter>,
)
