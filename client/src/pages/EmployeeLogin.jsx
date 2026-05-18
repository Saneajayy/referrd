import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const EmployeeLogin = () => {
  const [formData, setFormData] = useState({ work_email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/employee/login', formData);
      login(res.data.data.employee, 'employee', res.data.data.token);
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout animate-fade-in">
      <Card className="auth-card">
        <h2 className="title-large text-center" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Employee Login</h2>
        <p className="text-center text-muted mb-8">Access your referral dashboard</p>
        
        {error && <div className="badge badge-declined mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input type="email" name="work_email" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" required onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Spinner size={20} /> : 'Login'}
          </button>
        </form>
        <p className="text-center mt-4 text-muted">
          Not registered yet? <Link to="/employee/register" className="text-gradient">Sign Up</Link>
        </p>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
