import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css' 

import { UserProvider } from './context/userContext.jsx'; // Import Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>  {/* BUNGKUS APP DENGAN USERPROVIDER */}
        <App />
    </UserProvider>
  </React.StrictMode>,
)