import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [jobForm, setJobForm] = useState({ company_id: '', role_title: '', jd: '', job_link: '', expires_at: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', domain: '', logo_url: '' });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, compRes, jobsRes, empRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/companies'),
        api.get('/jobs'),
        api.get('/admin/employees')
      ]);
      setStats(statsRes.data.data);
      setCompanies(compRes.data.data);
      setJobs(jobsRes.data.data);
      setEmployees(empRes.data.data);
      
      if (compRes.data.data.length > 0) {
        setJobForm(prev => ({ ...prev, company_id: compRes.data.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/companies', companyForm);
      alert('Company created');
      setCompanyForm({ name: '', domain: '', logo_url: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create company');
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', jobForm);
      alert('Job created');
      setJobForm({ company_id: companies[0]?.id || '', role_title: '', jd: '', job_link: '', expires_at: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create job');
    }
  };

  const toggleJobStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/jobs/${id}`, { is_active: !currentStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update job status');
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const verifyEmployee = async (id) => {
    try {
      await api.patch(`/admin/employees/${id}/verify`);
      fetchData();
    } catch (err) {
      alert('Failed to verify employee');
    }
  };

  if (loading) return <div className="flex justify-center mt-8"><Spinner size={40} /></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      <h2 className="title-large mb-8">Admin Dashboard</h2>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm mb-1">Total Users</p>
          <h3 style={{ fontSize: '2rem' }}>{stats?.total_users}</h3>
        </Card>
        <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm mb-1">Total Employees</p>
          <h3 style={{ fontSize: '2rem' }}>{stats?.total_employees}</h3>
        </Card>
        <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm mb-1">Active Jobs</p>
          <h3 style={{ fontSize: '2rem' }}>{stats?.total_active_jobs}</h3>
        </Card>
        <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p className="text-muted text-sm mb-1">Requests Sent</p>
          <h3 style={{ fontSize: '2rem' }}>{stats?.total_referral_requests_sent}</h3>
        </Card>
        <Card style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--success)' }}>
          <p className="text-muted text-sm mb-1">Referrals Given</p>
          <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats?.total_referrals_given}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Post Company Form */}
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add New Company</h3>
          <form onSubmit={handleCompanySubmit}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-input" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Domain (e.g., google.com)</label>
              <input type="text" className="form-input" value={companyForm.domain} onChange={e => setCompanyForm({...companyForm, domain: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Logo URL</label>
              <input type="url" className="form-input" value={companyForm.logo_url} onChange={e => setCompanyForm({...companyForm, logo_url: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Add Company</button>
          </form>
        </Card>

        {/* Post Job Form */}
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Post New Job</h3>
          <form onSubmit={handleJobSubmit}>
            <div className="form-group">
              <label className="form-label">Company</label>
              <select className="form-input form-select" value={jobForm.company_id} onChange={e => setJobForm({...jobForm, company_id: e.target.value})} required>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Role Title</label>
              <input type="text" className="form-input" value={jobForm.role_title} onChange={e => setJobForm({...jobForm, role_title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Job Link</label>
              <input type="url" className="form-input" value={jobForm.job_link} onChange={e => setJobForm({...jobForm, job_link: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea className="form-input" rows="3" value={jobForm.jd} onChange={e => setJobForm({...jobForm, jd: e.target.value})} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Post Job</button>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Jobs Table */}
        <Card style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Manage Jobs</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Company</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>{job.role_title}</td>
                  <td style={{ padding: '0.75rem' }}>{job.company_name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={job.is_active ? 'text-success' : 'text-danger'}>{job.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => toggleJobStatus(job.id, job.is_active)} className="btn btn-secondary btn-sm mr-2" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Toggle</button>
                    <button onClick={() => deleteJob(job.id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Employees Table */}
        <Card style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Manage Employees</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Company</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>{emp.name}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{emp.work_email}</td>
                  <td style={{ padding: '0.75rem' }}>{emp.company_name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {emp.is_verified ? (
                      <span className="badge badge-referred">Verified</span>
                    ) : (
                      <button onClick={() => verifyEmployee(emp.id)} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
