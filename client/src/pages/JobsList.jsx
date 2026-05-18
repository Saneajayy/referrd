import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { Search, Building, Clock } from 'lucide-react';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [search]); // Normally you'd debounce this

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs?search=${search}`);
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="title-large" style={{ fontSize: '2.5rem' }}>Browse Roles</h2>
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search roles..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-8"><Spinner size={40} /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center mt-8 text-muted">No jobs found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <Card key={job.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex items-center gap-4 mb-4">
                {job.logo_url ? (
                  <img src={job.logo_url} alt={job.company_name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={24} color="var(--text-muted)" />
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{job.role_title}</h3>
                  <p className="text-muted">{job.company_name}</p>
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', flexGrow: 1 }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} /> 
                  <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link to={`/jobs/${job.id}`} className="btn btn-secondary" style={{ width: '100%' }}>View Details</Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsList;
