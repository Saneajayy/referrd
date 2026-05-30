import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import logoImg from '../assets/logo.png';
import { JOBS } from '../data/jobs';

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
    </div>
  );
}

/* ── Progress tracker ────────────────────────────────────────────────────── */
function ProgressBar({ status }) {
  const steps = ['Requested', 'Pending', 'Referred'];
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const isBad = ['declined', 'expired', 'withdrawn'].includes(status);

  return (
    <div className="my-6">
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const done = !isBad && (cfg.step > i || (cfg.step === 2 && i === 2));
          const active = !isBad && cfg.step === i && cfg.step !== 2;

          return (
            <div key={s} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {i > 0 && <div className={`flex-1 h-[2px] transition-colors duration-300 ${done || active ? 'bg-black' : 'bg-gray-200'}`} />}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${done || active ? 'border-black' : 'border-gray-200'} ${done ? 'bg-black' : 'bg-white'}`}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-black' : 'bg-gray-200'}`} />
                  )}
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-[2px] transition-colors duration-300 ${done && cfg.step > i ? 'bg-black' : 'bg-gray-200'}`} />}
              </div>
              <span className={`text-[11px] mt-2 ${active || done ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>{s}</span>
            </div>
          );
        })}
      </div>
      {isBad && (
        <div className="text-center mt-4 px-4 py-2 rounded-lg border text-[13px] font-medium" style={{ backgroundColor: cfg.bg, borderColor: `${cfg.color}30`, color: cfg.color }}>
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
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/40 flex items-end justify-center">
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[600px] bg-white rounded-t-[24px] px-7 pt-8 pb-10 border-2 border-black border-b-0 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1">{req.company}</p>
            <h2 className="text-2xl font-medium tracking-[-1px] text-black m-0">{req.job_title}</h2>
          </div>
          <button onClick={onClose} className="text-[22px] text-gray-400 hover:text-black p-1 leading-none">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>{cfg.label}</span>
          <span className="text-[12px] text-gray-400">· {daysAgo(req.created_at)}</span>
          {req.status === 'pending' && <span className="text-[12px] text-amber-500 font-medium">· {expiresIn(req.created_at)}</span>}
        </div>

        <ProgressBar status={req.status} />

        {req.note && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1">Note from referrer</p>
            <p className="text-[14px] text-gray-700 leading-relaxed m-0">{req.note}</p>
          </div>
        )}

        <div className="border-2 border-black rounded-2xl p-4 mb-5 shadow-[3px_4px_0px_0px_#000]">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-3">Referred by</p>
          {req.referrer_id ? (
            referrer ? (
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white text-[18px] shrink-0">
                  {referrer.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-[16px] font-medium tracking-[-0.5px] text-black m-0">{referrer.name}</p>
                  <p className="text-[13px] text-gray-500 m-0">{referrer.company || 'Employee'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span className="text-[13px] text-gray-400">Loading…</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <div>
                <p className="text-[15px] text-black m-0">Awaiting match</p>
                <p className="text-[12px] text-gray-400 m-0">We'll connect you with an employee soon</p>
              </div>
            </div>
          )}
        </div>

        {req.status === 'pending' && (
          <button
            onClick={() => onWithdraw(req.id)}
            disabled={withdrawing}
            className={`w-full py-3 rounded-full border-2 border-red-500 bg-white text-red-500 text-[15px] tracking-[-0.3px] transition-all ${withdrawing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50'}`}
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
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/40 flex items-end justify-center">
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[600px] bg-white rounded-t-[24px] px-7 pt-8 pb-10 border-2 border-black border-b-0 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1">Referral Request for</p>
            <h2 className="text-2xl font-medium tracking-[-1px] text-black m-0">{req.job_title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[12px] text-amber-500 font-medium">⏱ {expiresIn(req.created_at)}</span>
              {req.ai_score != null && (
                <span className={`text-[12px] px-2 py-0.5 rounded-full font-semibold ${req.ai_score >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  AI Score: {req.ai_score}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-[22px] text-gray-400 hover:text-black p-1 leading-none">✕</button>
        </div>

        <div className="border-2 border-black rounded-2xl p-4 mb-5 shadow-[3px_4px_0px_0px_#000]">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-3">Candidate Details</p>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white text-[18px] shrink-0">
              {req.seeker_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-[16px] font-medium tracking-[-0.5px] text-black m-0">{req.seeker_name}</p>
              <p className="text-[13px] text-gray-500 m-0">{req.seeker_email}</p>
              {req.seeker_college && <p className="text-[12px] text-gray-400 mt-0.5 m-0">🎓 {req.seeker_college}</p>}
            </div>
          </div>
        </div>

        <textarea
          placeholder="Add an optional note for the candidate..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full p-4 rounded-xl border-[1.5px] border-gray-300 text-[14px] min-h-[80px] mb-5 font-sans resize-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
        />

        <div className="flex gap-3">
          <button
            onClick={() => onAction(req.id, 'declined', note)}
            disabled={processing}
            className={`flex-1 py-3 rounded-full border-2 border-red-500 bg-white text-red-500 text-[15px] tracking-[-0.3px] transition-all ${processing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50'}`}
          >
            Decline
          </button>
          <button
            onClick={() => onAction(req.id, 'referred', note)}
            disabled={processing}
            className={`flex-[2] py-3 rounded-full border-2 border-emerald-500 bg-emerald-500 text-white text-[15px] font-medium shadow-[3px_4px_0px_0px_#065f46] transition-all ${processing ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
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
  const [currentUser, setCurrentUser] = useState(user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [savedJobIds, setSavedJobIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedJobs')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try { setSavedJobIds(JSON.parse(localStorage.getItem('savedJobs')) || []); }
      catch { setSavedJobIds([]); }
    };
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const savedJobsList = JOBS.filter(j => savedJobIds.includes(j.id));

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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setUploadingResume(true);
    const form = new FormData();
    form.append('resume', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setCurrentUser(prev => ({ ...prev, resume_filename: data.resume_filename }));
      alert('Resume uploaded successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  if (loading) return <Loading />;

  const pending = requests.filter(r => r.status === 'pending').length;
  const referred = requests.filter(r => r.status === 'referred').length;
  const initials = currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : currentUser.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans">
      <Navbar />
      <main className="pt-28 pb-16 px-6 max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[6px_8px_0px_0px_#000] flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-3xl font-medium tracking-[-1px] shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-medium tracking-[-1.5px] text-black mb-1">{currentUser.name}</h1>
              <p className="text-[14px] text-gray-500 mb-4">{currentUser.email}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 border border-gray-200 rounded-full px-3 py-1">Candidate</span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-full px-3 py-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>Active</span>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-white border-2 border-black rounded-2xl p-7 shadow-[4px_5px_0px_0px_#000]">
            <h2 className="text-[20px] font-medium tracking-[-1px] text-black mb-1">Your Resume</h2>
            <p className="text-[14px] text-gray-500 mb-5 leading-snug">
              {currentUser.resume_filename ? `Saved: ${currentUser.resume_filename}` : 'No resume uploaded yet. Upload one to use for AI matching.'}
            </p>
            <div className="relative">
              <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} className={`absolute inset-0 opacity-0 z-10 ${uploadingResume ? 'cursor-not-allowed' : 'cursor-pointer'}`} />
              <button className={`w-full bg-[#113824] text-white border-2 border-black rounded-xl py-3 px-4 text-[14px] font-medium shadow-[2px_3px_0px_0px_#000] transition-transform ${uploadingResume ? 'opacity-80' : 'hover:-translate-y-0.5'}`}>
                {uploadingResume ? 'Uploading...' : (currentUser.resume_filename ? 'Update Resume' : 'Upload Resume')}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[3px_4px_0px_0px_#000]">
              <p className="text-4xl font-medium tracking-[-2px] text-black">{requests.length}</p>
              <p className="text-[13px] text-gray-500 mt-1">Total apps</p>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[3px_4px_0px_0px_#000]">
              <p className="text-4xl font-medium tracking-[-2px] text-emerald-500">{referred}</p>
              <p className="text-[13px] text-gray-500 mt-1">Referred</p>
            </div>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 space-y-10">
          
          {/* Referral Requests */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-medium tracking-[-1.5px] text-black flex items-center gap-3">
                Referral Requests
                {pending > 0 && <span className="text-[13px] bg-amber-500 text-white rounded-full px-3 py-0.5 tracking-normal font-normal">{pending} pending</span>}
              </h2>
              <Link to="/jobs" className="text-[14px] text-gray-600 border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-100 transition-colors no-underline">Browse jobs →</Link>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-3xl p-12 shadow-[4px_5px_0px_0px_#000] text-center">
                <p className="text-[18px] font-medium text-black tracking-[-0.5px] mb-2">No referral requests yet</p>
                <p className="text-[15px] text-gray-500 mb-6">Browse open roles and request a referral from an employee.</p>
                <Link to="/jobs" className="inline-block bg-[#113824] text-white border-2 border-black rounded-full px-6 py-2.5 text-[15px] shadow-[3px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-transform no-underline">Browse Openings →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} onClick={() => setSelected(req)} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_4px_0px_0px_#000] cursor-pointer hover:-translate-y-1 transition-transform flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1 truncate">{req.company}</p>
                      <p className="text-[18px] font-medium tracking-[-0.5px] text-black mb-3 truncate">{req.job_title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border" style={{ backgroundColor: STATUS_CFG[req.status].bg, color: STATUS_CFG[req.status].color, borderColor: `${STATUS_CFG[req.status].color}30` }}>
                          {STATUS_CFG[req.status].label}
                        </span>
                        <span className="text-[12px] text-gray-400">{daysAgo(req.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-[20px] text-black pr-2">→</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Jobs */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-medium tracking-[-1.5px] text-black flex items-center gap-3">
                Saved Jobs
                {savedJobsList.length > 0 && <span className="text-[13px] bg-emerald-500 text-white rounded-full px-3 py-0.5 tracking-normal font-normal">{savedJobsList.length}</span>}
              </h2>
            </div>

            {savedJobsList.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-3xl p-10 shadow-[4px_5px_0px_0px_#000] text-center">
                <p className="text-[15px] text-gray-500">You haven't saved any jobs yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobsList.map(job => (
                  <Link key={job.id} to="/jobs" state={{ selectedId: job.id }} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_4px_0px_0px_#000] flex items-center justify-between gap-4 hover:-translate-y-1 transition-transform no-underline">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-gray-400">{job.company}</p>
                        <span className="text-[12px] text-gray-300">·</span>
                        <span className="text-[12px] text-gray-400">{job.type}</span>
                      </div>
                      <p className="text-[18px] font-medium tracking-[-0.5px] text-black truncate">{job.title}</p>
                    </div>
                    <span className="text-[20px] text-black pr-2">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
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
    <div className="min-h-screen bg-[#f4f4f5] font-sans">
      <Navbar />
      <main className="pt-28 pb-16 px-6 max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[6px_8px_0px_0px_#000] flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-3xl font-medium tracking-[-1px] shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-medium tracking-[-1.5px] text-black mb-1">{user.name}</h1>
              <p className="text-[14px] text-gray-500 mb-4">{user.company} · {user.designation}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 border border-gray-200 rounded-full px-3 py-1">Employee · Referrer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h2 className="text-3xl font-medium tracking-[-1.5px] text-black">
              Candidates for {user.company}
            </h2>
            <div className="flex gap-1 bg-gray-200 p-1 rounded-full self-start sm:self-auto">
              <button onClick={() => setTab('pending')} className={`px-5 py-1.5 rounded-full text-[14px] font-medium transition-all ${tab === 'pending' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Pending</button>
              <button onClick={() => setTab('history')} className={`px-5 py-1.5 rounded-full text-[14px] font-medium transition-all ${tab === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>History</button>
            </div>
          </div>

          {displayReqs.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-3xl p-12 shadow-[4px_5px_0px_0px_#000] text-center">
              <p className="text-[18px] font-medium text-black tracking-[-0.5px] mb-2">{tab === 'pending' ? 'No pending requests' : 'No history yet'}</p>
              <p className="text-[15px] text-gray-500">{tab === 'pending' ? "You're all caught up! Check back later for new candidates." : "Candidates you refer or decline will appear here."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayReqs.map(req => (
                <div key={req.id} onClick={() => setSelected(req)} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_4px_0px_0px_#000] cursor-pointer hover:-translate-y-1 transition-transform flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-gray-400">{req.seeker_name}</p>
                      
                    </div>
                    <p className="text-[18px] font-medium tracking-[-0.5px] text-black mb-3 truncate">{req.job_title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] text-amber-500 font-medium bg-amber-50 px-2 rounded-full border border-amber-200">⏱ {expiresIn(req.created_at)}</span>
                      {req.ai_score != null && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${req.ai_score >= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>AI Score: {req.ai_score}</span>
                      )}
                      {tab === 'history' && STATUS_CFG[req.status] && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold border" style={{ backgroundColor: STATUS_CFG[req.status].bg, color: STATUS_CFG[req.status].color, borderColor: `${STATUS_CFG[req.status].color}30` }}>{STATUS_CFG[req.status].label}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-[20px] text-black pr-2">→</div>
                </div>
              ))}
            </div>
          )}
        </div>
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
