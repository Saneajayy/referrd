import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';

const EmployeeRegister = () => {
  const [formData, setFormData] = useState({ name: '', work_email: '', password: '', designation: '', company_id: '', linkedin_url: '' });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data.data);
        if (res.data.data.length > 0) {
          setFormData(prev => ({ ...prev, company_id: res.data.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/employee/register', formData);
      // Redirect to OTP verification page and pass the email
      navigate('/employee/verify', { state: { email: formData.work_email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout animate-fade-in">
      <Card className="auth-card">
        <h2 className="title-large text-center" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Employee Access</h2>
        <p className="text-center text-muted mb-8">Register to refer candidates</p>
        
        {error && <div className="badge badge-declined mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input type="email" name="work_email" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <select name="company_id" className="form-input form-select" required onChange={handleChange} value={formData.company_id}>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <input type="text" name="designation" className="form-input" required onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input type="url" name="linkedin_url" className="form-input" onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Spinner size={20} /> : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-muted">
          Already registered? <Link to="/employee/login" className="text-gradient">Login</Link>
        </p>
      </Card>
    </div>
  );
};

export default EmployeeRegister;
