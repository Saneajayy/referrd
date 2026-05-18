import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import { CheckCircle2, XCircle } from 'lucide-react';

const AIScoreMatch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const matchData = location.state?.matchData;
  const job = location.state?.job;

  useEffect(() => {
    if (!matchData) {
      navigate(`/jobs/${id}`);
    }
  }, [matchData, navigate, id]);

  if (!matchData) return null;

  const { score, strengths, gaps, verdict } = matchData;
  const isMatch = score >= 50;

  // Circular progress math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = isMatch ? 'var(--success)' : 'var(--danger)';

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 className="title-large" style={{ fontSize: '2rem', marginBottom: '2rem' }}>AI Match Analysis</h2>
        
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 2rem' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} stroke="var(--bg-surface)" strokeWidth="12" fill="none" />
            <circle 
              cx="80" cy="80" r={radius} 
              stroke={color} 
              strokeWidth="12" 
              fill="none" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
            {score}%
          </div>
        </div>

        <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          {verdict}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <CheckCircle2 size={20} /> Strengths
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {strengths.map((s, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--success)' }}>•</span> {s}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <XCircle size={20} /> Gaps
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {gaps.map((g, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative', color: 'var(--text-secondary)' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--danger)' }}>•</span> {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isMatch ? (
          <div>
            <p className="mb-4" style={{ color: 'var(--success)', fontWeight: 600 }}>Great match! Choose employees to request a referral from.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(`/jobs/${id}/employees`, { state: { job, ai_score: score } })}
            >
              See Employees
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4" style={{ color: 'var(--danger)', fontWeight: 600 }}>Your profile is not a strong match for this role. Work on the gaps above and try again.</p>
            <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>
              Browse Other Roles
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AIScoreMatch;
