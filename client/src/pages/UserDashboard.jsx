import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { FileText, Edit2 } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/referral-requests/user');
        setRequests(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-pending">Pending</span>;
      case 'referred': return <span className="badge badge-referred">Referred</span>;
      case 'declined': return <span className="badge badge-declined">Declined</span>;
      case 'expired': return <span className="badge badge-expired">Expired</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <h2 className="title-large mb-8">My Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-1" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-start mb-4">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Profile</h3>
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <Edit2 size={16} />
            </Link>
          </div>
          <p className="mb-2"><strong>Name:</strong> {user?.name}</p>
          <p className="mb-2"><strong>Email:</strong> {user?.email}</p>
          <p className="mb-4"><strong>College:</strong> {user?.college || 'Not specified'}</p>
          
          {user?.resume_url ? (
            <div className="glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FileText color="var(--accent-primary)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Resume Uploaded</p>
                <a href={user.resume_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>View PDF</a>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--border-glass)' }}>
              <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>No resume uploaded. You need a resume to apply for referrals.</p>
              <Link to="/profile" className="btn btn-primary btn-sm">Upload Resume</Link>
            </div>
          )}
        </Card>

        <Card className="md:col-span-2" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, mb: '1rem' }}>Referral Requests</h3>
          
          {loading ? (
            <div className="flex justify-center mt-8"><Spinner /></div>
          ) : requests.length === 0 ? (
            <div className="text-center mt-8 text-muted">
              <p className="mb-4">No referral requests yet.</p>
              <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Job Title</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Company</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Employee</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date Sent</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{req.role_title}</td>
                      <td style={{ padding: '1rem' }}>{req.company_name}</td>
                      <td style={{ padding: '1rem' }}>{req.employee_name} <br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.designation}</span></td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(req.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
