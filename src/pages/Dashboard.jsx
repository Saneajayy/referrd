import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import logoImg from '../assets/logo.png';
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
  referred: { label: 'Referred', color: '#10b981', bg: '#f0fdf4', step: 2 },
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
        .catch(() => { });
    }
  }, [req.referrer_id]);

  return (
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center sm:p-6">
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-[600px] bg-white sm:rounded-3xl sm:border-[1px] sm:border-black rounded-t-3xl px-8 pt-8 pb-10 sm:shadow-[6px_8px_0px_0px_#000] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto">
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">{req.company}</p>
            <h2 className="text-[28px] font-medium tracking-[-1px] text-black m-0">{req.job_title}</h2>
          </div>
          <button onClick={onClose} className="text-[22px] text-gray-400 hover:text-black p-1 leading-none cursor-pointer">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] px-2.5 py-0.5 rounded-[7px] font-semibold border" style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>{cfg.label}</span>
          <span className="text-[12px] text-gray-400">· {daysAgo(req.created_at)}</span>
          {req.status === 'pending' && <span className="text-[12px] text-amber-500 font-medium">· {expiresIn(req.created_at)}</span>}
        </div>

        <ProgressBar status={req.status} />

        {req.note && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-400 mb-2">Note from referrer</p>
            <p className="text-[14px] text-gray-700 leading-relaxed m-0">{req.note}</p>
          </div>
        )}

        <div className="border-[1px] border-black rounded-2xl p-5 mb-6">
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-400 mb-3">
            {req.status === 'declined' ? 'Declined by' : req.status === 'referred' ? 'Referred by' : 'Referrer'}
          </p>
          {req.referrer_id ? (
            referrer ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-[18px] shrink-0">
                  {referrer.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-[16px] font-medium tracking-[-0.5px] text-black m-0">{referrer.name}</p>
                  <p className="text-[13px] text-gray-500 m-0 tracking-[-0.3px]">{referrer.company || 'Employee'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span className="text-[13px] text-gray-400 tracking-[-0.3px]">Loading…</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              </div>
              <div>
                <p className="text-[15px] font-medium tracking-[-0.5px] text-black m-0">Awaiting match</p>
                <p className="text-[13px] text-gray-500 m-0 tracking-[-0.3px]">We'll connect you with an employee soon</p>
              </div>
            </div>
          )}
        </div>

        {req.status === 'pending' && (
          <button
            onClick={() => onWithdraw(req.id)}
            disabled={withdrawing}
            className={`w-full py-3 rounded-xl border-[1px] border-red-500 bg-white text-red-500 text-[16px] font-medium shadow-[3px_4px_0px_0px_#ef4444] tracking-[-0.5px] transition-all cursor-pointer ${withdrawing ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#ef4444]'}`}
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
    <div onClick={onClose} className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center sm:p-6">
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-[600px] bg-white sm:rounded-3xl sm:border-[1px] sm:border-black rounded-t-3xl px-8 pt-8 pb-10 sm:shadow-[6px_8px_0px_0px_#000] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] overflow-y-auto">
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
          <button onClick={onClose} className="text-[22px] text-gray-400 hover:text-black p-1 leading-none cursor-pointer">✕</button>
        </div>

        <div className="border-[1px] border-black rounded-2xl p-5 mb-5">
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-400 mb-3">Candidate Details</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-[18px] shrink-0">
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
          className="w-full p-4 rounded-xl border-[1px] border-black text-[14px] min-h-[100px] mb-6 font-sans tracking-[-0.3px] resize-none focus:outline-none focus:shadow-[2px_3px_0px_0px_#000] transition-shadow bg-white"
        />

        <div className="flex gap-4">
          <button
            onClick={() => onAction(req.id, 'declined', note)}
            disabled={processing}
            className={`flex-1 py-3 rounded-xl border-[1px] border-red-500 bg-white text-red-500 text-[16px] font-medium tracking-[-0.5px] shadow-[3px_4px_0px_0px_#ef4444] transition-all cursor-pointer ${processing ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#ef4444]'}`}
          >
            Decline
          </button>
          <button
            onClick={() => onAction(req.id, 'referred', note)}
            disabled={processing}
            className={`flex-[2] py-3 rounded-xl border-[1px] border-black bg-[#113824] text-white text-[16px] font-medium tracking-[-0.5px] shadow-[3px_4px_0px_0px_#000] transition-all cursor-pointer ${processing ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#000]'}`}
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
  const [withdrawing, setWithdrawing] = useState(false);
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
                    <button onClick={() => reqRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-between bg-white border border-black rounded-xl py-2.5 px-4 shadow-[2px_3px_0px_0px_#000] cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all">
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">Requests sent</span>
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">{requests.length}</span>
                    </button>
                    <button onClick={() => reqRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-between bg-white border border-black rounded-xl py-2.5 px-4 shadow-[2px_3px_0px_0px_#000] cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all">
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">Referred</span>
                      <span className="text-[15px] text-black font-medium tracking-[-0.5px]">{referred}</span>
                    </button>
                    <button onClick={() => savedRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-between bg-white border border-black rounded-xl py-2.5 px-4 shadow-[2px_3px_0px_0px_#000] cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all">
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
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploadingResume} className={`absolute inset-0 opacity-0 z-10 ${uploadingResume ? 'cursor-not-allowed' : 'cursor-pointer'}`} />
                      <button className={`w-full bg-white text-black border-[1px] border-black rounded-lg py-2 px-4 text-[13px] font-medium tracking-[-0.5px] shadow-[2px_3px_0px_0px_#000] transition-transform ${uploadingResume ? 'opacity-80' : 'hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000]'}`}>
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
                    <Link to="/pricing" className="block w-full bg-white text-black border-[1px] border-black rounded-lg py-2.5 text-center text-[14px] font-medium tracking-[-0.5px] shadow-[3px_4px_0px_0px_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#000] no-underline">
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
                    <Link to="/jobs" className="text-[14px] text-black border border-black rounded-xl px-4 py-2 hover:bg-gray-100 shadow-[2px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all no-underline font-medium tracking-[-0.5px]">Browse jobs →</Link>
                  </div>

                  {requests.length === 0 ? (
                    <div className="bg-white border-[1px] border-black rounded-2xl p-12 text-center">
                      <p className="text-[18px] font-medium text-black tracking-[-0.5px] mb-2">No referral requests yet</p>
                      <p className="text-[15px] text-gray-500 tracking-[-0.3px]">Browse open roles and request a referral.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {requests.map(req => (
                        <button key={req.id} onClick={() => setSelected(req)} className="w-full text-left bg-white border-[1px] border-black rounded-xl p-5 shadow-[4px_5px_0px_0px_#000] cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_6px_0px_0px_#000] transition-all flex items-center justify-between gap-4">
                          <div className="flex items-center gap-5">
                            {getCompanyLogo(req.company) ? (
                              <img src={getCompanyLogo(req.company)} alt={req.company} className="w-8 h-8 object-contain shrink-0" />
                            ) : (
                              <div className="w-8 h-8 flex items-center justify-center text-[18px] font-medium text-black border border-black rounded-[7px] shrink-0">
                                {req.company?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-[17px] font-medium tracking-[-0.5px] text-black mb-1">{req.job_title}</p>
                              <p className="text-[14px] text-gray-500 tracking-[-0.3px] mb-2">
                                {req.company} · {req.referrer_id ? `${req.status === 'declined' ? 'Declined by' : 'Referred by'} ${req.referrer_name || 'an employee'}` : 'Awaiting match'}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[12px] font-medium tracking-[-0.3px] px-2.5 py-0.5 rounded-[7px] border border-black shadow-[1px_1px_0px_0px_#000]" style={{ backgroundColor: STATUS_CFG[req.status].bg, color: '#000' }}>
                                  {STATUS_CFG[req.status].label}
                                </span>
                                <span className="text-[13px] tracking-[-0.3px] text-gray-500">Sent {daysAgo(req.created_at)} {req.status === 'pending' ? `· Expires in ${expiresIn(req.created_at)}` : ''}</span>
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
                        <Link key={job.id} to="/jobs" state={{ selectedId: job.id }} className="bg-white border-[1px] border-black rounded-xl p-5 shadow-[4px_5px_0px_0px_#000] flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[5px_6px_0px_0px_#000] transition-all no-underline">
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
                          <span className="text-[20px] text-gray-400">›</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT POSTER PANEL (Static) */}
        <div className="w-[360px] shrink-0 border-l border-black bg-white p-8 hidden xl:flex flex-col items-center overflow-y-auto">
          <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <p className="text-[13px] font-medium tracking-[-0.3px] text-black">Poster Placeholder</p>
            <p className="text-[11px] text-gray-400 tracking-[-0.3px] text-center px-4 mt-1">Upload your marketing poster here later.</p>
          </div>
        </div>
      </div>

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
    <div className="bg-white min-h-screen overflow-hidden">
      <Navbar />

      <div className="flex w-full fixed top-16 bottom-0 left-0 right-0 overflow-hidden bg-white">

        {/* LEFT + CENTER WRAPPER */}
        <div className="flex-1 flex flex-col overflow-hidden">



          <div className="flex-1 flex overflow-hidden">
            {/* LEFT PANEL */}
            <div className="w-[360px] shrink-0 flex flex-col border-r border-black bg-white max-md:w-full overflow-y-auto xl:overflow-hidden xl:hover:overflow-y-auto">

              <div className="p-6 flex flex-col gap-6 flex-1 bg-white">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-gray-500 mb-3">Overview</p>
                  <div className="flex flex-col gap-2.5">
                    <button onClick={() => setTab('pending')} className={`flex items-center justify-between border border-black rounded-xl py-2.5 px-4 cursor-pointer hover:-translate-y-0.5 transition-transform bg-white text-black ${tab === 'pending' ? 'shadow-[4px_5px_0px_0px_#000] font-medium border-2' : 'shadow-[2px_3px_0px_0px_#000] font-normal'}`}>
                      <span className="text-[15px] tracking-[-0.5px]">Pending Requests</span>
                      <span className="text-[15px] tracking-[-0.5px]">{pendingReqs.length}</span>
                    </button>
                    <button onClick={() => setTab('history')} className={`flex items-center justify-between border border-black rounded-xl py-2.5 px-4 cursor-pointer hover:-translate-y-0.5 transition-transform bg-white text-black ${tab === 'history' ? 'shadow-[4px_5px_0px_0px_#000] font-medium border-2' : 'shadow-[2px_3px_0px_0px_#000] font-normal'}`}>
                      <span className="text-[15px] tracking-[-0.5px]">Reviewed History</span>
                      <span className="text-[15px] tracking-[-0.5px]">{historyReqs.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER PANEL */}
            <div className="flex-1 overflow-y-auto p-12 max-md:hidden bg-white">
              <div className="max-w-[800px] mx-auto w-full">

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <h2 className="text-[28px] font-medium tracking-[-1px] text-black m-0 leading-none">
                    {tab === 'pending' ? 'Pending Requests' : 'Reviewed History'}
                  </h2>
                </div>

                {displayReqs.length === 0 ? (
                  <div className="bg-white border-[1px] border-black rounded-2xl p-12 text-center">
                    <p className="text-[18px] font-medium text-black tracking-[-0.5px] mb-2">{tab === 'pending' ? 'No pending requests' : 'No history yet'}</p>
                    <p className="text-[15px] text-gray-500 tracking-[-0.3px]">{tab === 'pending' ? "You're all caught up! Check back later for new candidates." : "Candidates you refer or decline will appear here."}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {displayReqs.map(req => (
                      <button key={req.id} onClick={() => setSelected(req)} className="w-full text-left bg-white border-[1px] border-black rounded-xl p-5 shadow-[4px_5px_0px_0px_#000] cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_6px_0px_0px_#000] transition-all flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-[#113824] border border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-[18px] font-medium text-white shrink-0">
                            {req.seeker_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[17px] font-medium tracking-[-0.5px] text-black mb-1">{req.job_title}</p>
                            <p className="text-[14px] text-gray-500 tracking-[-0.3px] mb-2">
                              {req.seeker_name} · {req.company}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] text-amber-700 font-medium tracking-[-0.3px] bg-amber-100 border border-black shadow-[1px_1px_0px_0px_#000] px-2.5 py-0.5 rounded-full">⏱ {expiresIn(req.created_at)}</span>
                              {req.ai_score != null && (
                                <span className={`text-[13px] px-2.5 py-0.5 rounded-full font-medium tracking-[-0.3px] border border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1.5 ${req.ai_score >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  <span>AI Score:</span> <strong>{req.ai_score}</strong>
                                </span>
                              )}
                              {tab === 'history' && STATUS_CFG[req.status] && (
                                <span className="text-[12px] font-medium tracking-[-0.3px] px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]" style={{ backgroundColor: STATUS_CFG[req.status].bg, color: '#000' }}>
                                  {STATUS_CFG[req.status].label}
                                </span>
                              )}
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
          </div>
        </div>

        {/* RIGHT POSTER PANEL */}
        <div className="w-[360px] shrink-0 border-l border-black bg-white p-8 hidden xl:flex flex-col items-center overflow-y-auto">
          <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <p className="text-[13px] font-medium tracking-[-0.3px] text-black">Poster Placeholder</p>
            <p className="text-[11px] text-gray-400 tracking-[-0.3px] text-center px-4 mt-1">Upload your marketing poster here later.</p>
          </div>
        </div>
      </div>

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
