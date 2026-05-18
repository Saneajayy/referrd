import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Upload } from 'lucide-react';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', college: '', linkedin_url: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        college: user.college || '',
        linkedin_url: user.linkedin_url || ''
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      updateUser({ ...user, ...res.data.data });
      alert('Profile updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/users/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ ...user, ...res.data.data });
      alert('Resume uploaded successfully');
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <h2 className="title-large mb-8">Edit Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Personal Info</h3>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">College / University</label>
              <input type="text" name="college" className="form-input" value={formData.college} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input type="url" name="linkedin_url" className="form-input" value={formData.linkedin_url} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Spinner size={20} /> : 'Save Changes'}
            </button>
          </form>
        </Card>

        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Resume</h3>
          
          {user?.resume_url && (
            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Current Resume:</p>
              <a href={user.resume_url} target="_blank" rel="noreferrer" className="text-gradient font-medium">View Current PDF</a>
            </div>
          )}

          <form onSubmit={handleResumeUpload}>
            <div className="form-group">
              <label className="form-label">Upload New PDF Resume (Max 5MB)</label>
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: '8px', position: 'relative' }}>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <p className="text-muted">{file ? file.name : 'Click or drag PDF here'}</p>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!file || uploadLoading}>
              {uploadLoading ? <Spinner size={20} /> : 'Upload Resume'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
