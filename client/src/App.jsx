import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import EmployeeRegister from './pages/EmployeeRegister';
import EmployeeVerify from './pages/EmployeeVerify';
import EmployeeLogin from './pages/EmployeeLogin';
import AdminLogin from './pages/AdminLogin';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import AIScoreMatch from './pages/AIScoreMatch';
import EmployeeSelection from './pages/EmployeeSelection';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="page-wrapper">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* User Auth */}
            <Route path="/register" element={<UserRegister />} />
            <Route path="/login" element={<UserLogin />} />
            
            {/* Employee Auth */}
            <Route path="/employee/register" element={<EmployeeRegister />} />
            <Route path="/employee/verify" element={<EmployeeVerify />} />
            <Route path="/employee/login" element={<EmployeeLogin />} />
            
            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* User Protected */}
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/match" element={<AIScoreMatch />} />
            <Route path="/jobs/:id/employees" element={<EmployeeSelection />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            
            {/* Employee Protected */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            
            {/* Admin Protected */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
