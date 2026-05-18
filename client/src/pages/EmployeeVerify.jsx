import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const EmployeeVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/employee/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/employee/verify-email', { work_email: email, otp });
      login(res.data.data.employee, 'employee', res.data.data.token);
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout animate-fade-in">
      <Card className="auth-card">
        <h2 className="title-large text-center" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify Email</h2>
        <p className="text-center text-muted mb-8">Enter the 6-digit OTP sent to {email}</p>
        
        {error && <div className="badge badge-declined mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label text-center">OTP</label>
            <input 
              type="text" 
              className="form-input text-center" 
              style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              maxLength={6}
              required 
              value={otp}
              onChange={(e) => setOtp(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || otp.length < 6}>
            {loading ? <Spinner size={20} /> : 'Verify'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default EmployeeVerify;
