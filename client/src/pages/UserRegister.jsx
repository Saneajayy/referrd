import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const UserRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', college: '' });
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
      const res = await api.post('/auth/user/register', formData);
      login(res.data.data.user, 'user', res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout animate-fade-in">
      <Card className="auth-card">
        <h2 className="title-large text-center" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Job Seeker</h2>
        <p className="text-center text-muted mb-8">Create your account to get started</p>
        
        {error && <div className="badge badge-declined mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">College / University</label>
            <input type="text" name="college" className="form-input" onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Spinner size={20} /> : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4 text-muted">
          Already have an account? <Link to="/login" className="text-gradient">Login</Link>
        </p>
      </Card>
    </div>
  );
};

export default UserRegister;
