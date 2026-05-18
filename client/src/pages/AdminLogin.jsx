import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const res = await api.post('/auth/admin/login', formData);
      login({ name: 'Admin' }, 'admin', res.data.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout animate-fade-in">
      <Card className="auth-card" style={{ borderTop: '4px solid var(--danger)' }}>
        <h2 className="title-large text-center" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Portal</h2>
        <p className="text-center text-muted mb-8">Restricted Access</p>
        
        {error && <div className="badge badge-declined mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input type="email" name="email" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" required onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-danger" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Spinner size={20} /> : 'Login as Admin'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
