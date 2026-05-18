import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { UserPlus, Briefcase, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="text-center animate-fade-in" style={{ marginBottom: '4rem' }}>
        <h1 className="title-large text-gradient">Unlock Your Career Potential</h1>
        <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
          Connect with industry professionals. Get AI-matched to the right roles. Receive quality referrals without the cold outreach.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="btn btn-primary">I'm a Job Seeker</Link>
          <Link to="/employee/register" className="btn btn-secondary">I'm an Employee</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <Card className="text-center" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <Zap size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>AI-Powered Matching</h3>
          <p className="text-muted">Upload your resume and let our AI match your skills against real job descriptions instantly.</p>
        </Card>
        
        <Card className="text-center" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--success)' }}>
            <UserPlus size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Direct Referrals</h3>
          <p className="text-muted">Top matched candidates can request referrals directly from verified employees at top companies.</p>
        </Card>

        <Card className="text-center" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--warning)' }}>
            <Briefcase size={48} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Reward System</h3>
          <p className="text-muted">Employees earn points and recognition for referring highly qualified candidates to their company.</p>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
