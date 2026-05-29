import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import logoImg from '../assets/logo.png';

/* ── tiny helpers ────────────────────────────────────────────────────────── */
function authFetch(url, opts = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
}

function daysAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  return d === 0 ? 'today' : `${d}d ago`;
}

function expiresIn(dateStr) {
  const deadline = new Date(dateStr).getTime() + 3 * 86400000;
  const left = deadline - Date.now();
  if (left <= 0) return 'Expired';
  const h = Math.floor(left / 3600000);
  if (h < 24) return `${h}h left`;
  return `${Math.ceil(h / 24)}d left`;
}

/* ── status config ───────────────────────────────────────────────────────── */
const STATUS_CFG = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb', step: 1 },
  referred:  { label: 'Referred',  color: '#10b981', bg: '#f0fdf4', step: 2 },
  declined:  { label: 'Declined',  color: '#ef4444', bg: '#fef2f2', step: -1 },
  expired:   { label: 'Expired',   color: '#9ca3af', bg: '#f9fafb', step: -1 },
  withdrawn: { label: 'Withdrawn', color: '#9ca3af', bg: '#f9fafb', step: -1 },
};

/* ── Shared UI ───────────────────────────────────────────────────────────── */
function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #000', borderTop: '2px solid transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}



/* ── Progress tracker ────────────────────────────────────────────────────── */
function ProgressBar({ status }) {
  const steps = ['Requested', 'Pending', 'Referred'];
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const isBad = ['declined', 'expired', 'withdrawn'].includes(status);

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((s, i) => {
          // step 1 = pending (i=1), step 2 = referred (i=2)
          // For referred (step=2), i=2 should be 'done' (checkmark).
          const done = !isBad && (cfg.step > i || (cfg.step === 2 && i === 2));
          const active = !isBad && cfg.step === i && cfg.step !== 2;

          return (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && (
                  <div style={{ flex: 1, height: 2, background: done || active ? '#000' : '#e5e7eb', transition: 'background .3s' }} />
                )}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `2px solid ${done || active ? '#000' : '#e5e7eb'}`,
                  background: done ? '#000' : active ? '#fff' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all .3s',
                }}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#000' : '#e5e7eb' }} />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done && cfg.step > i ? '#000' : '#e5e7eb', transition: 'background .3s' }} />
                )}
              </div>
              <span style={{ fontSize: 11, color: done || active ? '#000' : '#9ca3af', marginTop: 6, fontWeight: active || done ? 600 : 400 }}>{s}</span>
            </div>
          );
        })}
      </div>
      {isBad && (
        <div style={{ textAlign: 'center', marginTop: 16, padding: '8px 16px', background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: 8, color: cfg.color, fontSize: 13, fontWeight: 500 }}>
          {cfg.label} — {status === 'declined' ? 'The referrer declined this request.' : status === 'expired' ? 'This request expired after 3 days.' : 'You withdrew this request.'}
        </div>
      )}
    </div>
  );
}

/* ── Candidate Detail Panel ──────────────────────────────────────────────── */
function CandidateDetailPanel({ req, onClose, onWithdraw, withdrawing }) {
  const [referrer, setReferrer] = useState(null);
  const cfg = STATUS_CFG[req.status] || STATUS_CFG.pending;

  useEffect(() => {
    if (req.referrer_id) {
      authFetch(`/api/referrals/referrer/${req.referrer_id}`)
        .then(r => r.json())
        .then(d => setReferrer(d.referrer))
        .catch(() => {});
    }
  }, [req.referrer_id]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 600, background: '#fff', borderRadius: '24px 24px 0 0',
          padding: '32px 28px 40px', border: '2px solid #000', borderBottom: 'none',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)', animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>{req.company}</p>
            <h2 style={{ fontSize: 24, fontWeight: 400, letterSpacing: '-1px', color: '#000', margin: 0 }}>{req.job_title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9ca3af', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 600, border: `1px solid ${cfg.color}40` }}>{cfg.label}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>· {daysAgo(req.created_at)}</span>
          {req.status === 'pending' && <span style={{ fontSize: 12, color: '#f59e0b' }}>· {expiresIn(req.created_at)}</span>}
        </div>

        <ProgressBar status={req.status} />

        {req.note && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Note from referrer</p>
            <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.5 }}>{req.note}</p>
          </div>
        )}

        <div style={{ border: '2px solid #000', borderRadius: 16, padding: '16px 20px', marginBottom: 20, boxShadow: '3px 4px 0 #000' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 12 }}>Referred by</p>
          {req.referrer_id ? (
            referrer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 400, flexShrink: 0 }}>
                  {referrer.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 400, letterSpacing: '-0.5px', color: '#000', margin: 0 }}>{referrer.name}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{referrer.company || 'Employee'}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #000', borderTop: '2px solid transparent', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</span>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 15, color: '#000', margin: 0 }}>Awaiting match</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>We'll connect you with an employee soon</p>
              </div>
            </div>
          )}
        </div>

        {req.status === 'pending' && (
          <button
            onClick={() => onWithdraw(req.id)}
            disabled={withdrawing}
            style={{
              width: '100%', padding: '12px', borderRadius: 40, border: '2px solid #ef4444',
              background: '#fff', color: '#ef4444', fontSize: 15, fontWeight: 400,
              cursor: withdrawing ? 'not-allowed' : 'pointer', opacity: withdrawing ? 0.6 : 1,
              letterSpacing: '-0.3px', transition: 'all .2s',
            }}
          >
            {withdrawing ? 'Withdrawing…' : 'Withdraw Request'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Employee Detail Panel ───────────────────────────────────────────────── */
function EmployeeDetailPanel({ req, onClose, onAction, processing }) {
  const [note, setNote] = useState('');

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 600, background: '#fff', borderRadius: '24px 24px 0 0',
          padding: '32px 28px 40px', border: '2px solid #000', borderBottom: 'none',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)', animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Referral Request for</p>
            <h2 style={{ fontSize: 24, fontWeight: 400, letterSpacing: '-1px', color: '#000', margin: 0 }}>{req.job_title}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#f59e0b' }}>⏱ {expiresIn(req.created_at)}</span>
              {req.ai_score != null && (
                <span style={{ fontSize: 12, background: req.ai_score >= 60 ? '#dcfce7' : '#fef08a', color: req.ai_score >= 60 ? '#166534' : '#854d0e', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>
                  AI Score: {req.ai_score}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9ca3af', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <div style={{ border: '2px solid #000', borderRadius: 16, padding: '16px 20px', marginBottom: 20, boxShadow: '3px 4px 0 #000' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 12 }}>Candidate Details</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 400, flexShrink: 0 }}>
              {req.seeker_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 400, letterSpacing: '-0.5px', color: '#000', margin: 0 }}>{req.seeker_name}</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{req.seeker_email}</p>
              {req.seeker_college && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, marginTop: 2 }}>🎓 {req.seeker_college}</p>}
            </div>
          </div>
        </div>

        <textarea
          placeholder="Add an optional note for the candidate..."
          value={note}
          onChange={e => setNote(e.target.value)}
          style={{ width: '100%', padding: 16, borderRadius: 12, border: '1.5px solid #d1d5db', fontSize: 14, minHeight: 80, marginBottom: 20, fontFamily: 'inherit', resize: 'none' }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onAction(req.id, 'declined', note)}
            disabled={processing}
            style={{ flex: 1, padding: '12px', borderRadius: 40, border: '2px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 15, cursor: processing ? 'not-allowed' : 'pointer', transition: 'all .2s' }}
          >
            Decline
          </button>
          <button
            onClick={() => onAction(req.id, 'referred', note)}
            disabled={processing}
            style={{ flex: 2, padding: '12px', borderRadius: 40, border: '2px solid #10b981', background: '#10b981', color: '#fff', fontSize: 15, fontWeight: 500, cursor: processing ? 'not-allowed' : 'pointer', boxShadow: '3px 4px 0 #065f46', transition: 'all .2s' }}
          >
            {processing ? 'Processing...' : 'Refer Candidate'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Candidate Dashboard ─────────────────────────────────────────────────── */
function CandidateDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    authFetch('/api/referrals/my')
      .then(r => r.json())
      .then(d => { if (d?.requests) setRequests(d.requests); })
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this referral request?')) return;
    setWithdrawing(true);
    try {
      const r = await authFetch(`/api/referrals/${id}/withdraw`, { method: 'PATCH' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'withdrawn' } : x));
      setSelected(prev => prev?.id === id ? { ...prev, status: 'withdrawn' } : prev);
    } catch (err) {
      alert(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <Loading />;

  const pending = requests.filter(r => r.status === 'pending').length;
  const referred = requests.filter(r => r.status === 'referred').length;
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email[0].toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <Navbar />
      <main style={{ paddingTop: 88, paddingBottom: 60, padding: '88px 24px 60px', maxWidth: 780, margin: '0 auto' }}>
        
        {/* Profile Card */}
        <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 28, padding: '40px 32px', boxShadow: '6px 8px 0 #000', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 400, flexShrink: 0, letterSpacing: '-1px' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 30, fontWeight: 400, letterSpacing: '-2px', color: '#000', margin: 0, marginBottom: 4 }}>{user.name}</h1>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, marginBottom: 10 }}>{user.email}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 12px' }}>Candidate · Job Seeker</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#10b981', border: '1px solid #d1fae5', borderRadius: 20, padding: '3px 12px', background: '#f0fdf4' }}>● Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 16, padding: '20px 24px', boxShadow: '3px 4px 0 #000' }}>
            <p style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-2px', color: '#000', margin: 0 }}>{requests.length}</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, marginTop: 4 }}>Total applications</p>
          </div>
          <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 16, padding: '20px 24px', boxShadow: '3px 4px 0 #000' }}>
            <p style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-2px', color: '#10b981', margin: 0 }}>{referred}</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, marginTop: 4 }}>Referred successfully</p>
          </div>
        </div>

        {/* List */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-1px', color: '#000', margin: 0 }}>
            Referral Requests
            {pending > 0 && <span style={{ marginLeft: 8, fontSize: 12, background: '#f59e0b', color: '#fff', borderRadius: 20, padding: '2px 9px', verticalAlign: 'middle' }}>{pending} pending</span>}
          </h2>
          <Link to="/jobs" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 20, padding: '6px 14px' }}>Browse jobs →</Link>
        </div>

        {requests.length === 0 ? (
          <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 20, padding: '48px 32px', boxShadow: '4px 5px 0 #000', textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 400, color: '#000', letterSpacing: '-0.5px', marginBottom: 6 }}>No referral requests yet</p>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Browse open roles and request a referral from an employee.</p>
            <Link to="/jobs" style={{ display: 'inline-block', background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 40, padding: '10px 28px', fontSize: 15, textDecoration: 'none', boxShadow: '3px 4px 0 #000' }}>Browse Job Openings →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map(req => (
              <div key={req.id} onClick={() => setSelected(req)} style={{ background: '#fff', border: '2px solid #000', borderRadius: 16, padding: '18px 20px', boxShadow: '3px 4px 0 #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 2 }}>{req.company}</p>
                  <p style={{ fontSize: 16, fontWeight: 400, letterSpacing: '-0.5px', color: '#000', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.job_title}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: STATUS_CFG[req.status].bg, color: STATUS_CFG[req.status].color, fontWeight: 600, border: `1px solid ${STATUS_CFG[req.status].color}30` }}>{STATUS_CFG[req.status].label}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{daysAgo(req.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && <CandidateDetailPanel req={selected} onClose={() => setSelected(null)} onWithdraw={handleWithdraw} withdrawing={withdrawing} />}
    </div>
  );
}

/* ── Employee Dashboard ──────────────────────────────────────────────────── */
function EmployeeDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [tab, setTab] = useState('pending'); // 'pending' | 'history'

  useEffect(() => {
    authFetch('/api/referrals/company')
      .then(r => r.json())
      .then(d => { if (d?.requests) setRequests(d.requests); })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action, note) => {
    setProcessing(true);
    try {
      const r = await authFetch(`/api/referrals/${id}/action`, {
        method: 'PATCH',
        body: JSON.stringify({ action, note })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      // Update local state so it moves to the history tab
      setRequests(prev => prev.map(x => x.id === id ? { ...x, status: action, referrer_id: user.id } : x));
      setSelected(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const pendingReqs = requests.filter(r => r.status === 'pending');
  const historyReqs = requests.filter(r => r.status !== 'pending' && r.referrer_id === user.id);
  const displayReqs = tab === 'pending' ? pendingReqs : historyReqs;

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <Navbar />
      <main style={{ paddingTop: 88, paddingBottom: 60, padding: '88px 24px 60px', maxWidth: 780, margin: '0 auto' }}>
        
        <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 28, padding: '40px 32px', boxShadow: '6px 8px 0 #000', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 400, flexShrink: 0, letterSpacing: '-1px' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 30, fontWeight: 400, letterSpacing: '-2px', color: '#000', margin: 0, marginBottom: 4 }}>{user.name}</h1>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, marginBottom: 10 }}>{user.company} · {user.designation}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 12px' }}>Employee · Referrer</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-1px', color: '#000', margin: 0 }}>
            Candidates for {user.company}
          </h2>
          <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 20 }}>
            <button onClick={() => setTab('pending')} style={{ background: tab === 'pending' ? '#fff' : 'transparent', border: 'none', borderRadius: 16, padding: '6px 14px', fontSize: 13, fontWeight: tab === 'pending' ? 600 : 400, color: tab === 'pending' ? '#000' : '#6b7280', cursor: 'pointer', boxShadow: tab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all .2s' }}>Pending</button>
            <button onClick={() => setTab('history')} style={{ background: tab === 'history' ? '#fff' : 'transparent', border: 'none', borderRadius: 16, padding: '6px 14px', fontSize: 13, fontWeight: tab === 'history' ? 600 : 400, color: tab === 'history' ? '#000' : '#6b7280', cursor: 'pointer', boxShadow: tab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all .2s' }}>History</button>
          </div>
        </div>

        {displayReqs.length === 0 ? (
          <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 20, padding: '48px 32px', boxShadow: '4px 5px 0 #000', textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 400, color: '#000', letterSpacing: '-0.5px', marginBottom: 6 }}>{tab === 'pending' ? 'No pending requests' : 'No history yet'}</p>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>{tab === 'pending' ? "You're all caught up! Check back later for new candidates." : "Candidates you refer or decline will appear here."}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayReqs.map(req => (
              <div key={req.id} onClick={() => setSelected(req)} style={{ background: '#fff', border: '2px solid #000', borderRadius: 16, padding: '18px 20px', boxShadow: '3px 4px 0 #000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>{req.seeker_name}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {req.ai_score != null && (
                        <span style={{ fontSize: 11, background: req.ai_score >= 60 ? '#dcfce7' : '#fef08a', color: req.ai_score >= 60 ? '#166534' : '#854d0e', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>AI Score: {req.ai_score}</span>
                      )}
                      {tab === 'history' && STATUS_CFG[req.status] && (
                        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: STATUS_CFG[req.status].bg, color: STATUS_CFG[req.status].color, fontWeight: 600 }}>{STATUS_CFG[req.status].label}</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 400, letterSpacing: '-0.5px', color: '#000', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.job_title}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 500 }}>⏱ {expiresIn(req.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && <EmployeeDetailPanel req={selected} onClose={() => setSelected(null)} onAction={handleAction} processing={processing} />}
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    authFetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { localStorage.removeItem('token'); navigate('/login'); return; }
        // If they are an employee but somehow landed here, redirect them to the right URL
        if (d.user.role === 'referrer') {
          navigate('/employee-dashboard');
          return;
        }
        setUser(d.user);
      })
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <Loading />;
  if (!user) return null;

  return <CandidateDashboard user={user} onLogout={handleLogout} />;
}

export function EmployeeDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/employee-login'); return; }
    authFetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== 'referrer') { localStorage.removeItem('token'); navigate('/employee-login'); return; }
        setUser(d.user);
      })
      .catch(() => { localStorage.removeItem('token'); navigate('/employee-login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <Loading />;
  if (!user) return null;

  return <EmployeeDashboard user={user} onLogout={handleLogout} />;
}
