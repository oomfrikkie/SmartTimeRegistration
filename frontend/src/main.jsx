import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.jsx'

const CLIENT_ID = 'f68133ef-fbb5-4a26-a51d-b0b76bbd7aec'
const TENANT_ID = '7e0609fe-cffc-471d-8777-264f711051f6'
const REDIRECT_URI = `${window.location.origin}/`

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: REDIRECT_URI,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
})

msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_SUCCESS ||
    event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
  ) {
    const account = event.payload?.account
    if (account) msalInstance.setActiveAccount(account)
  }
})

const root = createRoot(document.getElementById('root'))

root.render(
  <div
    style={{
      fontFamily: 'sans-serif',
      textAlign: 'center',
      marginTop: '3em',
    }}
  >
    Loading authentication...
  </div>,
)

;(async () => {
  try {
    await msalInstance.initialize()

    const res = await msalInstance.handleRedirectPromise()

    if (res?.account) {
      msalInstance.setActiveAccount(res.account)
      console.log('[MSAL] Redirect result account set:', res.account)
      console.log('[Signup] Microsoft signup/login successful for:', res.account?.username || res.account?.name)

      const loginStarted = sessionStorage.getItem('msal_login_started') === '1'
      if (loginStarted) {
        const fullName = (res.account?.name || '').trim()
        const [firstName, ...restName] = fullName.split(' ').filter(Boolean)
        const surname = restName.join(' ')

        try {
          const backendResponse = await fetch('http://localhost:3000/account/microsoft-register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              email: res.account?.username,
              name: firstName || fullName || 'Microsoft',
              surname: surname || 'User',
            }),
          })

          const backendData = await backendResponse.json()
          if (!backendResponse.ok) {
            console.error('[Signup] Microsoft backend registration failed:', backendData)
          } else {
            console.log('[Signup] Microsoft account persisted in backend:', backendData)
          }
        } catch (error) {
          console.error('[Signup] Microsoft backend registration request failed:', error)
        }

        sessionStorage.removeItem('msal_login_started')
        // Use intended redirect target if set
        const redirectTarget = sessionStorage.getItem('msal_redirect_target') || '/home';
        sessionStorage.removeItem('msal_redirect_target');
        if (window.location.pathname !== redirectTarget) {
          window.location.replace(redirectTarget);
          return;
        }
      }
    } else {
      const cached = msalInstance.getAllAccounts()
      if (!msalInstance.getActiveAccount() && cached.length > 0) {
        msalInstance.setActiveAccount(cached[0])
        console.log('[MSAL] Active account set from cache:', cached[0])
      }

      if (sessionStorage.getItem('msal_login_started') === '1') {
        sessionStorage.removeItem('msal_login_started')
      }
    }
  } catch (err) {
    console.error('[MSAL] init/redirect error:', err)
  } finally {
    root.render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MsalProvider>
      </StrictMode>,
    )
  }
})()
