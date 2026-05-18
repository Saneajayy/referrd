import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, borderRadius: 0, borderBottom: '1px solid var(--border-glass)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '5rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
          <Briefcase color="var(--accent-primary)" />
          <span>Referr'd</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!role && (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
          {role === 'user' && (
            <>
              <Link to="/jobs" className="btn btn-secondary">Browse Jobs</Link>
              <Link to="/dashboard" className="btn btn-secondary"><LayoutDashboard size={18} /> Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-danger"><LogOut size={18} /> Logout</button>
            </>
          )}
          {role === 'employee' && (
            <>
              <Link to="/employee/dashboard" className="btn btn-secondary"><LayoutDashboard size={18} /> Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-danger"><LogOut size={18} /> Logout</button>
            </>
          )}
          {role === 'admin' && (
            <>
              <Link to="/admin" className="btn btn-secondary"><LayoutDashboard size={18} /> Admin</Link>
              <button onClick={handleLogout} className="btn btn-danger"><LogOut size={18} /> Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
