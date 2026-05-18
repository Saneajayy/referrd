import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Building, ExternalLink, Zap } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApplyWithReferral = async () => {
    if (!user?.resume_url) {
      alert('Please upload your resume in your profile first.');
      navigate('/profile');
      return;
    }

    setMatchLoading(true);
    try {
      const res = await api.post('/match', { job_id: id });
      // Navigate to match result page with data
      navigate(`/jobs/${id}/match`, { state: { matchData: res.data.data, job } });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error during AI matching');
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-8"><Spinner size={40} /></div>;
  if (!job) return <div className="text-center mt-8 text-muted">Job not found.</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <Card style={{ padding: '2rem' }}>
        <div className="flex items-center gap-6 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-glass)' }}>
          {job.logo_url ? (
            <img src={job.logo_url} alt={job.company_name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'contain', backgroundColor: 'white' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={40} color="var(--text-muted)" />
            </div>
          )}
          <div>
            <h1 className="title-large" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{job.role_title}</h1>
            <p className="text-muted" style={{ fontSize: '1.25rem' }}>{job.company_name}</p>
          </div>
        </div>

        <div className="mb-8" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Job Description</h3>
          <p className="text-secondary">{job.jd}</p>
        </div>

        <div className="flex gap-4 pt-6" style={{ borderTop: '1px solid var(--border-glass)' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1 }} 
            onClick={handleApplyWithReferral}
            disabled={matchLoading}
          >
            {matchLoading ? <Spinner size={20} /> : <><Zap size={18} /> Apply with Referral</>}
          </button>
          
          <a href={job.job_link} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1 }}>
            <ExternalLink size={18} /> Apply Directly
          </a>
        </div>
      </Card>
    </div>
  );
};

export default JobDetail;
