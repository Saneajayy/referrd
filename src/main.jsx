import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import EmployeeLogin from './pages/EmployeeLogin.jsx'
import EmployeeSignup from './pages/EmployeeSignup.jsx'
import Dashboard, { EmployeeDashboardPage } from './pages/Dashboard.jsx'
import Pricing from './pages/Pricing.jsx'
import JobOpenings from './pages/JobOpenings.jsx'
import JobDetail from './pages/JobDetail.jsx'
import ResumeMatch from './pages/ResumeMatch.jsx'
import ManageAccount from './pages/ManageAccount.jsx'
import Profile from './pages/Profile.jsx'

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
        {/* Protected dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboardPage />} />
        {/* Pricing */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/jobs" element={<JobOpenings />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/:id/apply" element={<ResumeMatch />} />
        <Route path="/manage-account" element={<ManageAccount />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
