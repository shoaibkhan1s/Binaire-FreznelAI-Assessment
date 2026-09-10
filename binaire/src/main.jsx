import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, defaultTheme } from '@adobe/react-spectrum'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider theme={defaultTheme} colorScheme="dark">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
