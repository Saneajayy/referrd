import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import api from '../api/axiosConfig';
import { ExternalLink, Check, Users } from 'lucide-react';

const EmployeeSelection = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;
  const ai_score = location.state?.ai_score;

  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!job || !ai_score) {
      navigate(`/jobs/${id}`);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await api.get(`/employees/companies/${job.company_id}`);
        setEmployees(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [id, job, ai_score, navigate]);

  const toggleSelect = (empId) => {
    if (selected.includes(empId)) {
      setSelected(selected.filter(id => id !== empId));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, empId]);
      }
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitLoading(true);
    try {
      await api.post('/referral-requests', {
        job_id: id,
        employee_ids: selected,
        ai_score
      });
      alert('Referral requests sent successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending requests');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-8"><Spinner size={40} /></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="title-large" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Request Referral</h2>
          <p className="text-muted">Select up to 3 employees from {job?.company_name}</p>
        </div>
        <div className="badge badge-pending" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          {selected.length}/3 Selected
        </div>
      </div>

      {employees.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Employees Available</h3>
          <p className="text-muted">There are currently no verified employees from this company on our platform. You can still apply directly.</p>
          <a href={job?.job_link} target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
            <ExternalLink size={18} /> Apply Directly
          </a>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {employees.map(emp => {
              const isSelected = selected.includes(emp.id);
              return (
                <Card 
                  key={emp.id} 
                  className={isSelected ? 'selected-card' : ''}
                  style={{ 
                    padding: '1.5rem', 
                    cursor: 'pointer', 
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    position: 'relative'
                  }}
                  onClick={() => toggleSelect(emp.id)}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-primary)' }}>
                      <Check size={20} />
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{emp.name}</h3>
                  <p className="text-muted" style={{ marginBottom: '1rem' }}>{emp.designation}</p>
                  
                  {emp.linkedin_url && (
                    <a 
                      href={emp.linkedin_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} /> LinkedIn Profile
                    </a>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button 
              className="btn btn-primary" 
              disabled={selected.length === 0 || submitLoading}
              onClick={handleSubmit}
            >
              {submitLoading ? <Spinner size={20} /> : 'Send Referral Requests'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeSelection;
