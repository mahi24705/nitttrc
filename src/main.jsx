import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from "./context/AuthContext"; // ✅ ADD THIS

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>   {/* ✅ WRAP */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
)
