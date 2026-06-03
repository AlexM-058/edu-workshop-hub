import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthRoot from './auth/AuthRoot.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AuthRoot>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthRoot>
    </I18nProvider>
  </StrictMode>,
)
