import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import logoImg from '../assets/newlogo.png';
import googleImg from '../assets/GOOG.png';
import microsoftImg from '../assets/Microsoft_logo.svg.png';
import appleImg from '../assets/AAPL.png';
import nvidiaImg from '../assets/NVDA.png';
import netflixImg from '../assets/NFLX.png';
import spotifyImg from '../assets/SPOT.png';
import amazonImg from '../assets/AMZN-e9f942e4.png';
import Lottie from 'lottie-react';
import resumeHireAnimation from '../assets/resumehire.json';
import { JOBS } from '../data/jobs';

const LottieComponent = Lottie.default || Lottie;

const COMPANY_LOGOS = {
  google: googleImg,
  microsoft: microsoftImg,
  apple: appleImg,
  nvidia: nvidiaImg,
  netflix: netflixImg,
  spotify: spotifyImg,
  amazon: amazonImg
};

function getCompanyLogo(company) {
  if (!company) return null;
  const key = company.toLowerCase();
  for (const [k, v] of Object.entries(COMPANY_LOGOS)) {
    if (key.includes(k)) return v;
  }
  return null;
}

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
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb', step: 1 },
  pending_verification: { label: 'Verifying', color: '#3b82f6', bg: '#eff6ff', step: 2 },
  referred: { label: 'Referred', color: '#10b981', bg: '#f0fdf4', step: 3 },
  disputed: { label: 'Disputed', color: '#ef4444', bg: '#fef2f2', step: -1 },
  declined: { label: 'Declined', color: '#ef4444', bg: '#fef2f2', step: -1 },
  expired: { label: 'Expired', color: '#9ca3af', bg: '#f9fafb', step: -1 },
  withdrawn: { label: 'Withdrawn', color: '#9ca3af', bg: '#f9fafb', step: -1 },
};

/* ── Shared UI ───────────────────────────────────────────────────────────── */
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-transparent animate-spin" />
    </div>
  );
}

/* ── Progress tracker ────────────────────────────────────────────────────── */
function ProgressBar({ status }) {
  const steps = ['Requested', 'Pending', 'Verifying', 'Referred'];
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const isBad = ['declined', 'expired', 'withdrawn', 'disputed'].includes(status);

  return (
    <div className="my-6">
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const done = !isBad && (cfg.step > i || (cfg.step === 3 && i === 3));
          const active = !isBad && cfg.step === i && cfg.step !== 3;

          return (
            <div key={s} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {i > 0 && <div className={`flex-1 h-[2px] transition-colors duration-300 ${done || active ? 'bg-black' : 'bg-gray-200'} hover:bg-gray-900`} />}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${done || active ? 'border-black' : 'border-gray-200'} ${done ? 'bg-black' : 'bg-white'} hover:bg-gray-50`}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-black' : 'bg-gray-200'} hover:bg-gray-900`} />
                  )}
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-[2px] transition-colors duration-300 ${done && cfg.step > i ? 'bg-black' : 'bg-gray-200'} hover:bg-gray-900`} />}
              </div>
              <span className={`text-[11px] mt-2 ${active || done ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>{s}</span>
            </div>
          );
        })}
      </div>
      {isBad && (
        <div className="text-center mt-4 px-4 py-2 rounded-lg border text-[13px] font-medium" style={{ backgroundColor: cfg.bg, borderColor: `${cfg.color}30`, color: cfg.color }}>
          {cfg.label} — {status === 'declined' ? 'The referrer declined this request.' : status === 'disputed' ? 'You reported this referral as not received.' : status === 'expired' ? 'This request expired after 3 days.' : 'You withdrew this request.'}
        </div>
      )}
    </div>
  );
}

/* ── Candidate Detail Panel ──────────────────────────────────────────────── */
function CandidateDetailPanel({ group, onClose, onWithdraw, withdrawing, onVerify, verifying }) {
  const cfg = STATUS_CFG[group.status] || STATUS_CFG.pending;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center sm:p-6">
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-[600px] bg-white sm:rounded-3xl sm:border-[1px] sm:border-gray-200 rounded-t-3xl px-8 pt-8 pb-10 sm:shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto">
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">{group.company}</p>
            <h2 className="text-[28px] font-medium tracking-[-1px] text-black m-0">{group.job_title}</h2>
          </div>
          <button onClick={onClose} className="text-[22px] text-gray-400 hover:text-black p-1 leading-none cursor-pointer hover:bg-gray-50">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] px-2.5 py-0.5 rounded-[7px] font-semibold border" style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>{cfg.label}</span>
          <span className="text-[12px] text-gray-400">· Requested from {group.items.length} employee{group.items.length !== 1 ? 's' : ''}</span>
        </div>

        <h3 className="text-[14px] font-medium tracking-[-0.5px] text-black mb-3 px-1">Requested Referrers</h3>

        <div className="flex flex-col gap-3 mb-6">
          {group.items.map(req => {
            const reqCfg = STATUS_CFG[req.status] || STATUS_CFG.pending;
            return (
              <div key={req.id} className="border-[1px] border-gray-200 bg-gray-50/50 rounded-xl p-4">
                {req.referrer_id ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black font-medium text-[15px] shrink-0 shadow-sm">
                          {req.referrer_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-[15px] font-medium tracking-[-0.5px] text-black m-0 leading-tight">{req.referrer_name}</p>
                          <p className="text-[12px] text-gray-500 m-0 tracking-[-0.3px] mt-0.5">{req.referrer_designation || 'Employee'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold border" style={{ backgroundColor: reqCfg.bg, color: reqCfg.color, borderColor: `${reqCfg.color}40` }}>{reqCfg.label}</span>
                        {req.referrer_linkedin && (
                          <a href={req.referrer_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#0a66c2] bg-[#f3f9ff] hover:bg-[#e1f0ff] border border-[#0a66c2]/20 px-2.5 py-1 rounded-full transition-colors font-medium text-[12px] tracking-[-0.2px] no-underline shrink-0">
                            Connect
                          </a>
                        )}
                      </div>
                    </div>

                    {req.note && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 mt-1">
                        <p className="text-[13px] text-gray-700 m-0 leading-snug"><span className="font-medium text-black">Note:</span> {req.note}</p>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <button
                        onClick={() => onWithdraw(req.id)}
                        disabled={withdrawing}
                        className={`text-[12px] text-red-500 font-medium tracking-[-0.3px] self-start mt-1 hover:underline cursor-pointer ${withdrawing ? 'opacity-50' : ''}`}
                      >
                        {withdrawing ? 'Withdrawing...' : 'Withdraw specific request'}
                      </button>
                    )}

                    {req.status === 'pending_verification' && (
                      <div className="flex flex-col gap-2 mt-2 border-t border-gray-200 pt-3">
                        <span className="text-[12px] text-gray-600 font-medium">Did they refer you?</span>
                        <div className="flex gap-2">
                          <button onClick={() => onVerify(req.id, 'confirm')} disabled={verifying} className="bg-black text-white px-3 py-1.5 text-[11px] rounded-md hover:opacity-90 transition-opacity">Yes</button>
                          <button onClick={() => onVerify(req.id, 'deny')} disabled={verifying} className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 text-[11px] rounded-md hover:bg-gray-50 transition-colors">No</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] text-gray-500">Awaiting match</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Employee Detail Panel ───────────────────────────────────────────────── */
function EmployeeDetailPanel({ req, onClose, onAction, processing }) {
  const [note, setNote] = useState('');

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center sm:p-6">
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-[600px] bg-white sm:rounded-3xl sm:border-[1px] sm:border-gray-200 rounded-t-3xl px-8 pt-8 pb-10 sm:shadow-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto">
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">Referral Request</p>
            <h2 className="text-[28px] font-medium tracking-[-1px] text-black m-0">{req.job_title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[12px] text-amber-500 font-medium tracking-[-0.3px] bg-amber-50 px-2 py-0.5 border border-amber-200 rounded">⏱ {expiresIn(req.created_at)}</span>
              {req.ai_score != null && (
                <span className={`text-[12px] px-2 py-0.5 rounded font-semibold tracking-[-0.3px] border ${req.ai_score >= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  AI Score: {req.ai_score}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-[22px] text-gray-400 hover:text-black p-1 leading-none cursor-pointer hover:bg-gray-50">✕</button>
        </div>

        <h3 className="text-[14px] font-medium tracking-[-0.5px] text-black mb-2 px-1">Candidate Details</h3>
        <div className="border-[1px] border-gray-200 bg-gray-50/50 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-black font-medium text-[16px] shrink-0">
              {req.seeker_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-[16px] font-medium tracking-[-0.5px] text-black m-0">{req.seeker_name}</p>
              <p className="text-[13px] text-gray-500 m-0 tracking-[-0.3px]">{req.seeker_email}</p>
              {req.seeker_college && <p className="text-[12px] text-gray-500 mt-0.5 m-0 tracking-[-0.3px]">🎓 {req.seeker_college}</p>}
            </div>
          </div>
        </div>

        <textarea
          placeholder="Add an optional note for the candidate..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full p-4 rounded-xl border-[1px] border-black text-[14px] min-h-[100px] mb-6 font-sans tracking-[-0.3px] resize-none focus:outline-none bg-white"
        />

        <div className="flex gap-4">
          <button
            onClick={() => onAction(req.id, 'declined', note)}
            disabled={processing}
            className={`flex-1 py-3 rounded-xl border-[1px] border-red-500 bg-white text-red-500 text-[16px] font-medium tracking-[-0.5px] transition-all cursor-pointer ${processing ? 'opacity-60 cursor-not-allowed' : ''} hover:bg-gray-50`}
          >
            Decline
          </button>
          <button
            onClick={() => onAction(req.id, 'pending_verification', note)}
            disabled={processing}
            className={`flex-[2] py-3 rounded-xl border-[1px] border-black bg-[#113824] text-white text-[16px] font-medium tracking-[-0.5px] transition-all cursor-pointer ${processing ? 'opacity-60 cursor-not-allowed' : ''} hover:opacity-90`}
          >
            {processing ? 'Processing...' : 'Refer Candidate ✦'}
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

  const groupedRequests = useMemo(() => {
    const groups = {};
    requests.forEach(r => {
      const key = `${r.company}-${r.job_title}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          company: r.company,
          job_title: r.job_title,
          items: [],
          created_at: r.created_at,
        };
      }
      groups[key].items.push(r);
      if (new Date(r.created_at) > new Date(groups[key].created_at)) {
        groups[key].created_at = r.created_at;
      }
    });

    Object.values(groups).forEach(g => {
      if (g.items.some(r => r.status === 'referred')) g.status = 'referred';
      else if (g.items.some(r => r.status === 'pending_verification')) g.status = 'pending_verification';
      else if (g.items.some(r => r.status === 'pending')) g.status = 'pending';
      else if (g.items.every(r => r.status === 'declined')) g.status = 'declined';
      else if (g.items.every(r => r.status === 'expired')) g.status = 'expired';
      else if (g.items.every(r => r.status === 'withdrawn')) g.status = 'withdrawn';
      else g.status = 'declined';
    });

    return Object.values(groups).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [requests]);

  const activities = useMemo(() => {
    let events = [];
    requests.forEach(r => {
      events.push({
        id: `created-${r.id}`,
        time: new Date(r.created_at),
        type: 'created',
        message: `You requested a referral to ${r.company} for ${r.job_title}.`
      });

      if (r.status !== 'pending' && r.updated_at) {
        let msg = '';
        if (r.status === 'referred') msg = `${r.referrer_name || 'An employee'} referred you for ${r.job_title} at ${r.company}!`;
        else if (r.status === 'pending_verification') msg = `${r.referrer_name || 'An employee'} indicated they referred you to ${r.company}. Please verify!`;
        else if (r.status === 'declined') msg = `Your request to ${r.company} was declined.`;
        else if (r.status === 'withdrawn') msg = `You withdrew your request to ${r.company}.`;
        else if (r.status === 'expired') msg = `Your request to ${r.company} expired.`;
        else if (r.status === 'disputed') msg = `You disputed a referral from ${r.referrer_name || 'an employee'} at ${r.company}.`;

        if (msg) {
          events.push({
            id: `updated-${r.id}`,
            time: new Date(r.updated_at),
            type: r.status,
            message: msg
          });
        }
      }
    });
    return events.sort((a, b) => b.time - a.time);
  }, [requests]);

  const [withdrawing, setWithdrawing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const reqRef = useRef(null);
  const savedRef = useRef(null);

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
      setSelected(prev => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map(i => i.id === id ? { ...i, status: 'withdrawn' } : i)
        };
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleUnsaveJob = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = savedJobIds.filter(jobId => jobId !== id);
    setSavedJobIds(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
    window.dispatchEvent(new Event('storage'));
  };

  const handleVerify = async (id, action) => {
    setVerifying(true);
    try {
      const r = await authFetch(`/api/referrals/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      const newStatus = action === 'confirm' ? 'referred' : 'disputed';
      setRequests(prev => prev.map(x => x.id === id ? { ...x, status: newStatus } : x));
      setSelected(prev => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map(i => i.id === id ? { ...i, status: newStatus } : i)
        };
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifying(false);
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
    <div className="bg-white min-h-screen overflow-hidden">
      <Navbar />

      <div className="flex w-full fixed top-16 bottom-0 left-0 right-0 overflow-hidden bg-white">

        {/* LEFT + CENTER WRAPPER */}
        <div className="flex-1 flex flex-col overflow-hidden">



          <div className="flex-1 flex overflow-hidden">
            {/* LEFT PANEL */}
            <div className="w-[360px] shrink-0 flex flex-col border-r border-black bg-white max-md:w-full overflow-hidden">

              <div className="p-6 flex flex-col gap-6 flex-1 bg-white h-full overflow-hidden">

                {/* Overview Section */}
                <div>
                  <p className="text-[11px] font-medium tracking-[0.4px] uppercase text-gray-500 mb-3">Overview</p>
                  <div className="flex flex-col gap-2.5">
                    <button onClick={() => reqRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-between bg-white border border-black rounded-xl py-2.5 px-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">Requests sent</span>
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">{requests.length}</span>
                    </button>
                    <button onClick={() => reqRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-between bg-white border border-black rounded-xl py-2.5 px-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">Referred</span>
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">{referred}</span>
                    </button>
                    <button onClick={() => savedRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-between bg-white border border-black rounded-xl py-2.5 px-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">Saved jobs</span>
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">{savedJobsList.length}</span>
                    </button>
                  </div>
                </div>

                {/* Resume Section */}
                <div>
                  <p className="text-[11px] font-medium tracking-[0.4px] uppercase text-gray-500 mb-3">Resume</p>
                  <div className="bg-white border-[1px] border-black rounded-xl p-4">
                    {currentUser.resume_filename ? (
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium tracking-[-0.5px] text-black mb-0.5 truncate max-w-[180px]">{currentUser.resume_filename}</p>
                          <p className="text-[12px] text-gray-500 tracking-[-0.3px]">Uploaded to profile</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px] text-gray-500 tracking-[-0.3px] mb-4 leading-snug">No resume uploaded yet. Upload one to use for AI matching.</p>
                    )}

                    <div className="relative">
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} className={`absolute inset-0 opacity-0 z-10 ${uploadingResume ? 'cursor-not-allowed' : 'cursor-pointer'} hover:bg-gray-50`} />
                      <button className={`w-full bg-white text-black border-[1px] border-black rounded-lg py-2 px-4 text-[13px] font-medium tracking-[-0.5px] transition-transform ${uploadingResume ? 'opacity-80' : ''}`}>
                        {uploadingResume ? 'Uploading...' : 'Update Resume'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketing / Pro Upgrade */}
                <div className="bg-[#113824] border-[1px] border-black rounded-xl p-5 flex flex-col flex-1 min-h-0">
                  <div className="w-full flex-1 min-h-0 rounded-lg overflow-hidden relative mb-5 flex items-center justify-center">
                    <LottieComponent animationData={resumeHireAnimation} loop={true} className="w-[120%] h-[120%] object-contain" />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-black bg-[#a7f3d0] border border-black px-2 py-0.5 rounded-[6px]">Pro</span>
                    </div>
                    <h3 className="text-[16px] font-medium tracking-[-0.5px] text-white mb-2 leading-snug">Want higher match scores?</h3>
                    <p className="text-[13px] text-[#a7f3d0] opacity-90 mb-4 leading-relaxed tracking-[-0.3px]">
                      Upgrade to unlock AI resume tailoring, priority placement, and skill gap analysis.
                    </p>
                    <Link to="/pricing" className="block w-full bg-white text-black border-[1px] border-black rounded-lg py-2.5 text-center text-[14px] font-medium tracking-[-0.5px] transition-transform no-underline">
                      View Pricing
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* CENTER PANEL (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-12 max-md:hidden bg-white">
              <div className="max-w-[800px] mx-auto w-full">

                {/* Referral Requests */}
                <section className="mb-16" ref={reqRef}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[28px] font-medium tracking-[-1px] text-black m-0 leading-none flex items-center gap-3">
                      Referral Requests
                      {pending > 0 && <span className="text-[14px] bg-[#fffbeb] text-[#f59e0b] border border-[#f59e0b]/30 rounded-full px-3 py-1 tracking-normal font-medium">{pending} pending</span>}
                    </h2>
                    <Link to="/jobs" className="text-[14px] text-black border border-black rounded-xl px-4 py-2 hover:bg-gray-100 transition-all no-underline font-medium tracking-[-0.5px]">Browse jobs →</Link>
                  </div>

                  {requests.length === 0 ? (
                    <div className="bg-white border-[1px] border-black rounded-2xl p-12 text-center">
                      <p className="text-[18px] font-medium text-black tracking-[-0.5px] mb-2">No referral requests yet</p>
                      <p className="text-[15px] text-gray-500 tracking-[-0.3px]">Browse open roles and request a referral.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {groupedRequests.map(group => (
                        <button key={group.id} onClick={() => setSelected(group)} className="w-full text-left bg-white border-[1px] border-black rounded-xl p-5 cursor-pointer transition-all flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                          <div className="flex items-center gap-5">
                            {getCompanyLogo(group.company) ? (
                              <img src={getCompanyLogo(group.company)} alt={group.company} className="w-8 h-8 object-contain shrink-0" />
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center text-[18px] font-medium text-black border border-black rounded-[7px] shrink-0">
                                {group.company?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-[17px] font-medium tracking-[-0.5px] text-black mb-1">{group.job_title}</p>
                              <p className="text-[14px] text-gray-500 tracking-[-0.3px] mb-2">
                                {group.company} · {group.items.length} employee request{group.items.length !== 1 ? 's' : ''}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[12px] font-medium tracking-[-0.3px] px-2.5 py-0.5 rounded-[7px] border border-black" style={{ backgroundColor: STATUS_CFG[group.status].bg, color: '#000' }}>
                                  {STATUS_CFG[group.status].label}
                                </span>
                                <span className="text-[13px] tracking-[-0.3px] text-gray-500">Sent {daysAgo(group.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-[20px] text-gray-400">›</div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* Saved Jobs */}
                <section ref={savedRef}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[28px] font-medium tracking-[-1px] text-black m-0 leading-none flex items-center gap-3">
                      Saved Jobs
                      {savedJobsList.length > 0 && <span className="text-[14px] bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-3 py-1 tracking-normal font-medium">{savedJobsList.length}</span>}
                    </h2>
                  </div>

                  {savedJobsList.length === 0 ? (
                    <div className="bg-white border-[1px] border-dashed border-gray-400 rounded-2xl p-10 text-center">
                      <p className="text-[16px] text-gray-500 tracking-[-0.5px] font-medium">You haven't saved any jobs yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {savedJobsList.map(job => (
                        <Link key={job.id} to="/jobs" state={{ selectedId: job.id }} className="bg-white border-[1px] border-black rounded-xl p-5 flex items-center justify-between gap-4 transition-all no-underline hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                          <div className="flex items-center gap-5">
                            {getCompanyLogo(job.company) ? (
                              <img src={getCompanyLogo(job.company)} alt={job.company} className="w-8 h-8 object-contain shrink-0" />
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center text-[18px] font-medium text-black border border-black rounded-full shrink-0">
                                {job.company?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-[17px] font-medium tracking-[-0.5px] text-black mb-1">{job.title}</p>
                              <p className="text-[14px] text-gray-500 tracking-[-0.3px] mb-0">
                                {job.company} · {job.location} <span className="text-emerald-600 font-medium tracking-[-0.5px] ml-1">· {Math.floor(Math.random() * 5) + 1} referrers available</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleUnsaveJob(e, job.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm"
                              title="Unsave job"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <span className="text-[20px] text-gray-400">›</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT NOTIFICATION PANEL */}
        <div className="w-[360px] shrink-0 border-l border-black bg-gray-50 p-6 hidden xl:flex flex-col overflow-y-auto">
          <h3 className="text-[18px] font-medium tracking-[-0.5px] text-black mb-5">Recent Activity</h3>
          {activities.length === 0 ? (
            <div className="bg-white border-[1px] border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-[13px] text-gray-500 tracking-[-0.3px]">No activity yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-200 z-0"></div>
              {activities.map((act) => (
                <div key={act.id} className="flex gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[2px] border-gray-50 mt-0.5 ${act.type === 'referred' ? 'bg-emerald-500' : act.type === 'pending_verification' ? 'bg-amber-500' : act.type === 'declined' || act.type === 'withdrawn' ? 'bg-red-500' : 'bg-black'}`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] text-black tracking-[-0.3px] leading-snug m-0">{act.message}</p>
                    <p className="text-[12px] text-gray-400 tracking-[-0.3px] mt-1 m-0">{daysAgo(act.time.toISOString())}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && <CandidateDetailPanel group={selected} onClose={() => setSelected(null)} onWithdraw={handleWithdraw} withdrawing={withdrawing} onVerify={handleVerify} verifying={verifying} />}
    </div>
  );
}

/* ── Employee Dashboard ──────────────────────────────────────────────────── */
function EmployeeDashboard({ user, onLogout }) {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMyRequest, setSelectedMyRequest] = useState(null);
  const [selectedIncoming, setSelectedIncoming] = useState(null);

  const [processing, setProcessing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [verifying, setVerifying] = useState(false);

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
    Promise.all([
      authFetch('/api/referrals/company').then(r => r.json()),
      authFetch('/api/referrals/my').then(r => r.json())
    ])
      .then(([companyData, myData]) => {
        if (companyData?.requests) setIncomingRequests(companyData.requests);
        if (myData?.requests) setMyRequests(myData.requests);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedMyRequests = useMemo(() => {
    const groups = {};
    myRequests.forEach(r => {
      const key = `${r.company}-${r.job_title}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          company: r.company,
          job_title: r.job_title,
          items: [],
          created_at: r.created_at,
        };
      }
      groups[key].items.push(r);
      if (new Date(r.created_at) > new Date(groups[key].created_at)) {
        groups[key].created_at = r.created_at;
      }
    });

    Object.values(groups).forEach(g => {
      if (g.items.some(r => r.status === 'referred')) g.status = 'referred';
      else if (g.items.some(r => r.status === 'pending_verification')) g.status = 'pending_verification';
      else if (g.items.some(r => r.status === 'pending')) g.status = 'pending';
      else if (g.items.every(r => r.status === 'declined')) g.status = 'declined';
      else if (g.items.every(r => r.status === 'expired')) g.status = 'expired';
      else if (g.items.every(r => r.status === 'withdrawn')) g.status = 'withdrawn';
      else g.status = 'declined';
    });

    return Object.values(groups).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [myRequests]);

  const handleAction = async (id, action, note) => {
    setProcessing(true);
    try {
      const r = await authFetch(`/api/referrals/${id}/action`, {
        method: 'PATCH',
        body: JSON.stringify({ action, note })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setIncomingRequests(prev => prev.map(x => x.id === id ? { ...x, status: action, referrer_id: user.id } : x));
      setSelectedIncoming(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this referral request?')) return;
    setWithdrawing(true);
    try {
      const r = await authFetch(`/api/referrals/${id}/withdraw`, { method: 'PATCH' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setMyRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'withdrawn' } : x));
      setSelectedMyRequest(prev => {
        if (!prev || !prev.items) return prev;
        return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, status: 'withdrawn' } : i) };
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleVerify = async (id, action) => {
    setVerifying(true);
    try {
      const r = await authFetch(`/api/referrals/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      const newStatus = action === 'confirm' ? 'referred' : 'disputed';
      setMyRequests(prev => prev.map(x => x.id === id ? { ...x, status: newStatus } : x));
      setSelectedMyRequest(prev => {
        if (!prev || !prev.items) return prev;
        return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, status: newStatus } : i) };
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <Loading />;

  const referralsGivenCount = incomingRequests.filter(r => (r.status === 'referred' || r.status === 'pending_verification') && r.referrer_id === user.id).length;
  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'pending').length;
  const pendingIncomingList = incomingRequests.filter(r => r.status === 'pending');

  return (
    <div className="bg-white min-h-screen overflow-hidden">
      <Navbar />

      <div className="flex w-full fixed top-16 bottom-0 left-0 right-0 overflow-hidden bg-white">
        <div className="flex-1 flex overflow-hidden">

          {/* COLUMN 1: LEFT PANEL (Stats) */}
          <div className="w-[320px] shrink-0 flex flex-col border-r border-black bg-white max-md:w-full overflow-y-auto">
            <div className="p-6 flex flex-col gap-6 flex-1 bg-white">
              <div>
                <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-500 mb-3">Overview</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border border-black rounded-xl py-2.5 px-4 bg-gray-50 text-black">
                    <span className="text-[15px] font-medium tracking-[-0.5px]">Points</span>
                    <span className="text-[15px] font-bold text-emerald-600 tracking-[-0.5px] flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      {user.points || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl py-2.5 px-4 bg-white text-black">
                    <span className="text-[15px] font-medium tracking-[-0.5px]">Referrals Given</span>
                    <span className="text-[15px] tracking-[-0.5px]">{referralsGivenCount}</span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl py-2.5 px-4 bg-white text-black">
                    <span className="text-[15px] font-medium tracking-[-0.5px]">My Requests</span>
                    <span className="text-[15px] tracking-[-0.5px]">{myRequests.length}</span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl py-2.5 px-4 bg-white text-black">
                    <span className="text-[15px] font-medium tracking-[-0.5px]">Pending Incoming</span>
                    <span className="text-[15px] tracking-[-0.5px]">{pendingIncomingCount}</span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl py-2.5 px-4 bg-white text-black">
                    <span className="text-[15px] font-medium tracking-[-0.5px]">Saved Jobs</span>
                    <span className="text-[15px] tracking-[-0.5px]">{savedJobsList.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTER PANEL (My Requests) */}
          <div className="flex-1 border-r border-black overflow-y-auto p-10 max-md:hidden bg-white">
            <div className="w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[24px] font-medium tracking-[-1px] text-black m-0 leading-none">
                  My Requests
                </h2>
                <Link to="/jobs" className="text-[13px] text-black border border-black rounded-xl px-4 py-1.5 hover:bg-gray-100 transition-all no-underline font-medium tracking-[-0.5px]">Browse jobs →</Link>
              </div>

              {groupedMyRequests.length === 0 ? (
                <div className="bg-white border-[1px] border-black rounded-2xl p-10 text-center">
                  <p className="text-[16px] font-medium text-black tracking-[-0.5px] mb-2">No referral requests yet</p>
                  <p className="text-[14px] text-gray-500 tracking-[-0.3px]">You can also request referrals from other companies.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {groupedMyRequests.map(group => (
                    <button key={group.id} onClick={() => setSelectedMyRequest(group)} className="w-full text-left bg-white border-[1px] border-black rounded-xl p-5 cursor-pointer transition-all flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                      <div className="flex items-center gap-5">
                        {getCompanyLogo(group.company) ? (
                          <img src={getCompanyLogo(group.company)} alt={group.company} className="w-8 h-8 object-contain shrink-0" />
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center text-[18px] font-medium text-black border border-black rounded-[7px] shrink-0">
                            {group.company?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[16px] font-medium tracking-[-0.5px] text-black mb-1">{group.job_title}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-medium tracking-[-0.3px] px-2.5 py-0.5 rounded-[7px] border border-black" style={{ backgroundColor: STATUS_CFG[group.status].bg, color: '#000' }}>
                              {STATUS_CFG[group.status].label}
                            </span>
                            <span className="text-[13px] tracking-[-0.3px] text-gray-500">Sent {daysAgo(group.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[20px] text-gray-400">›</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: RIGHT PANEL (Incoming Requests) */}
          <div className="flex-1 overflow-y-auto p-10 bg-gray-50">
            <div className="w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[24px] font-medium tracking-[-1px] text-black m-0 leading-none">
                  Incoming Requests
                </h2>
              </div>

              {pendingIncomingList.length === 0 ? (
                <div className="bg-white border-[1px] border-dashed border-gray-300 rounded-2xl p-10 text-center">
                  <p className="text-[16px] font-medium text-black tracking-[-0.5px] mb-2">No pending requests</p>
                  <p className="text-[14px] text-gray-500 tracking-[-0.3px]">You're all caught up!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingIncomingList.map(req => (
                    <button key={req.id} onClick={() => setSelectedIncoming(req)} className="w-full text-left bg-white border-[1px] border-black rounded-xl p-5 cursor-pointer transition-all flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000000]">
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#113824] border border-black flex items-center justify-center text-[16px] font-medium text-white shrink-0">
                              {req.seeker_name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p className="text-[15px] font-medium tracking-[-0.5px] text-black mb-0.5">{req.seeker_name}</p>
                              <p className="text-[12px] text-gray-500 tracking-[-0.3px] truncate max-w-[150px]">{req.seeker_email}</p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          </div>
                        </div>
                        <div className="w-full h-px bg-gray-100"></div>
                        <div className="flex justify-between items-center">
                          <p className="text-[14px] font-medium tracking-[-0.3px] text-black m-0">{req.job_title}</p>
                          {req.ai_score != null && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium tracking-[-0.3px] border ${req.ai_score >= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              Score: {req.ai_score}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {selectedMyRequest && <CandidateDetailPanel group={selectedMyRequest} onClose={() => setSelectedMyRequest(null)} onWithdraw={handleWithdraw} withdrawing={withdrawing} onVerify={handleVerify} verifying={verifying} />}
      {selectedIncoming && <EmployeeDetailPanel req={selectedIncoming} onClose={() => setSelectedIncoming(null)} onAction={handleAction} processing={processing} />}
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
        if (d.user.role === 'referrer') { navigate('/employee-dashboard'); return; }
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
