import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Star, Download, Check, X } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth(); // Actually this is employee data but stored as user in context
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/referral-requests/employee');
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/referral-requests/${id}`, { status });
      // Remove from list with animation (by filtering it out)
      setRequests(requests.filter(req => req.id !== id));
      if (status === 'referred') {
        alert('Candidate referred! You earned 10 points.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="title-large" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Hello, {user?.name}</h2>
          <p className="text-muted">{user?.designation} • {user?.company_name}</p>
        </div>
        <Card style={{ padding: '1rem 2rem', textAlign: 'center', background: 'var(--bg-card)' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Points</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>{user?.points || 0}</p>
        </Card>
      </div>

      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Referral Inbox</h3>

      {loading ? (
        <div className="flex justify-center mt-8"><Spinner size={40} /></div>
      ) : requests.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-muted">No pending referral requests at the moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(req => (
            <Card key={req.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{req.candidate_name}</h4>
                    {req.is_top_5 && <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Star size={12} fill="currentColor" /> Top Match</span>}
                  </div>
                  <p className="text-muted mb-2">Applied for: <strong style={{ color: 'var(--text-primary)' }}>{req.role_title}</strong></p>
                  <a href={`mailto:${req.candidate_email}`} className="text-gradient" style={{ fontSize: '0.875rem' }}>{req.candidate_email}</a>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>AI Match Score</p>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: req.ai_score >= 80 ? 'var(--success)' : req.ai_score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                    {req.ai_score}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
                <a href={req.resume_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <Download size={16} /> Download Resume
                </a>
                <div className="flex gap-2">
                  <button className="btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }} onClick={() => handleAction(req.id, 'declined')}>
                    <X size={18} /> Decline
                  </button>
                  <button className="btn btn-success" onClick={() => handleAction(req.id, 'referred')}>
                    <Check size={18} /> Refer
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
