import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import EmployeeLogin from './pages/EmployeeLogin.jsx'
import EmployeeSignup from './pages/EmployeeSignup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* Candidate routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Employee (referrer) routes */}
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee-signup" element={<EmployeeSignup />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
