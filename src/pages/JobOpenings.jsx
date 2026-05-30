import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { JOBS } from '../data/jobs.js';
import Navbar from '../components/Navbar.jsx';

import googleLogo from '../assets/GOOG.png';
import msftLogo from '../assets/Microsoft_logo.svg.png';
import nvidiaLogo from '../assets/NVDA.png';
import amazonLogo from '../assets/AMZN-e9f942e4.png';
import netflixLogo from '../assets/NFLX.png';
import spotifyLogo from '../assets/SPOT.png';
import appleLogo from '../assets/AAPL.png';

const COMPANY_COLORS = {
  Google:    '#4285F4',
  Microsoft: '#00A4EF',
  Nvidia:    '#76B900',
  Amazon:    '#FF9900',
  Netflix:   '#E50914',
  Spotify:   '#1DB954',
  Apple:     '#555555',
};

const COMPANY_LOGOS = {
  Google: googleLogo,
  Microsoft: msftLogo,
  Nvidia: nvidiaLogo,
  Amazon: amazonLogo,
  Netflix: netflixLogo,
  Spotify: spotifyLogo,
  Apple: appleLogo,
};

const getCompanyLogo = (company) => COMPANY_LOGOS[company] || null;

const STATE = { IDLE: 'idle', LOADING: 'loading', STRONG: 'strong', WEAK: 'weak', ERROR: 'error' };

function ScoreMeter({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-2 my-4">
      <svg width="100" height="100" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="50" fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 50}`}
          strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="60" y="65" textAnchor="middle" fontSize="28" fontWeight="normal" fill={color} fontFamily="Inter, sans-serif">
          {score}
        </text>
      </svg>
      <span className="text-[13px] text-gray-500 tracking-[-0.2px] uppercase font-semibold">match score</span>
    </div>
  );
}

function daysAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

export default function JobOpenings() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [savedJobs, setSavedJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedJobs')) || []; }
    catch { return []; }
  });

  const [appliedTitles, setAppliedTitles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch('/api/referrals/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d?.requests) setAppliedTitles(d.requests.map(req => req.job_title)); })
      .catch(() => {});

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d?.user) setCurrentUser(d.user); })
      .catch(() => {});
  }, []);

  const toggleSave = (id) => {
    setSavedJobs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('savedJobs', JSON.stringify(next));
      return next;
    });
  };

  const filteredJobs = JOBS.filter(j => {
    if (category !== 'All' && j.type !== category) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const [selectedId, setSelectedId] = useState(location.state?.selectedId ?? (JOBS[0]?.id ?? null));
  const job = filteredJobs.find(j => j.id === selectedId) || filteredJobs[0];
  const hasApplied = job ? appliedTitles.includes(job.title) : false;

  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [matchHistory, setMatchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('matchHistory')) || {}; }
    catch { return {}; }
  });
  const [activeUploadJobId, setActiveUploadJobId] = useState(null);
  const [uploadState, setUploadState] = useState(STATE.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const fileRef = useRef(null);

  const currentHistory = job ? matchHistory[job.id] : null;
  const matchState = (activeUploadJobId === job?.id && (uploadState === STATE.LOADING || uploadState === STATE.ERROR))
    ? uploadState
    : (currentHistory ? currentHistory.state : STATE.IDLE);
  const matchResult = currentHistory ? currentHistory.result : null;
  const fileName = activeUploadJobId === job?.id && uploadState !== STATE.IDLE ? uploadFileName : (currentHistory ? currentHistory.fileName : '');

  const resetMatch = () => {
    if (job) {
      setMatchHistory(prev => {
        const next = { ...prev };
        delete next[job.id];
        localStorage.setItem('matchHistory', JSON.stringify(next));
        return next;
      });
    }
    setActiveUploadJobId(null);
    setUploadState(STATE.IDLE);
    setErrorMsg('');
  };

  const handleJobSelect = (id) => {
    setSelectedId(id);
    setIsApplying(false);
    setActiveUploadJobId(null);
    setUploadState(STATE.IDLE);
    setErrorMsg('');
  };

  const handleFile = async (file) => {
    if (file && file.type !== 'application/pdf') {
      setErrorMsg('Please upload a PDF file.');
      setActiveUploadJobId(job.id);
      setUploadState(STATE.ERROR);
      return;
    }
    setUploadFileName(file ? file.name : (currentUser?.resume_filename || 'Saved Resume'));
    setActiveUploadJobId(job.id);
    setUploadState(STATE.LOADING);
    setErrorMsg('');

    const form = new FormData();
    if (file) form.append('resume', file);
    form.append('jobId', job.id);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs/match-resume', { 
        method: 'POST', 
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Scoring failed.');
      
      const newState = data.score >= 60 ? STATE.STRONG : STATE.WEAK;
      setMatchHistory(prev => {
        const next = { ...prev, [job.id]: { state: newState, result: data, fileName: file ? file.name : (currentUser?.resume_filename || 'Saved Resume') } };
        localStorage.setItem('matchHistory', JSON.stringify(next));
        return next;
      });
      setUploadState(STATE.IDLE);
    } catch (err) {
      setErrorMsg(err.message);
      setUploadState(STATE.ERROR);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRequestReferral = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setRequesting(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_title: job.title, company: job.company, ai_score: matchResult.score })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit request.');
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
      setRequesting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Two-panel layout below navbar */}
      <div className="flex h-[calc(100vh-64px)] mt-16 w-full">

        {/* ── LEFT PANEL: Job list ─────────────────────────────────────────── */}
        <div className="w-[360px] shrink-0 flex flex-col border-r border-black bg-white overflow-hidden max-md:w-full">

          {/* List header */}
          <div className="px-6 pt-8 pb-6 border-b border-black">
            <h1 className="text-[32px] tracking-[-1px] font-medium text-black m-0 leading-none">Job Openings</h1>
            <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] mt-3 mb-5 max-w-[300px]">
              {filteredJobs.length} openings · referrals at every company
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-black text-[15px] outline-none focus:shadow-[2px_3px_0px_0px_#000] transition-shadow bg-white"
              />
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-black text-[15px] outline-none focus:shadow-[2px_3px_0px_0px_#000] transition-shadow appearance-none bg-white cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Internship">Internships</option>
                  <option value="Full-time">Full-time</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {filteredJobs.length === 0 ? (
              <p className="text-gray-500 text-[15px] text-center mt-4">No jobs found matching your search.</p>
            ) : filteredJobs.map((j) => {
              const active = j.id === (job?.id);
              return (
                <button
                  key={j.id}
                  onClick={() => handleJobSelect(j.id)}
                  style={{
                    borderColor: active ? (COMPANY_COLORS[j.company] || '#000') : '#000',
                    boxShadow: active
                      ? `4px 6px 0px 0px ${COMPANY_COLORS[j.company] || '#000'}`
                      : '4px 6px 0px 0px #000000',
                    backgroundColor: active ? '#f0fdf4' : '#fff'
                  }}
                  className="w-full text-left rounded-xl p-5 border-[1px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000]"
                >
                  {/* Company */}
                  <div className="flex items-center gap-2 mb-1.5">
                    {getCompanyLogo(j.company) ? (
                      <img src={getCompanyLogo(j.company)} alt={j.company} className="w-5 h-5 object-contain shrink-0" />
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: COMPANY_COLORS[j.company] || '#000' }}
                      />
                    )}
                    <span className="text-[13px] font-medium tracking-[0.05em] uppercase text-gray-500">
                      {j.company}
                    </span>
                  </div>
                  {/* Title */}
                  <p className="text-[16px] leading-[1.2] mb-2.5 tracking-[-0.5px] font-medium text-black">
                    {j.title}
                  </p>
                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-[13px] text-gray-500 font-sans">{j.location}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[13px] text-gray-500 font-sans">{daysAgo(j.postedAt)}</span>
                  </div>
                  {/* Referrer pill */}
                  <div className="inline-flex items-center gap-1.5 bg-[#113824] text-white text-[12px] font-sans px-3 py-1 rounded-md border border-black shadow-[2px_2px_0px_0px_#000000]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {j.availableReferrers} referrer{j.availableReferrers !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: Job detail ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-white max-md:hidden">
          {job ? (
            <div className="max-w-[960px] px-16 py-12">

              {/* Company + color */}
              <div className="flex items-center gap-3 mb-6">
                {getCompanyLogo(job.company) ? (
                  <img src={getCompanyLogo(job.company)} alt={job.company} className="w-7 h-7 object-contain rounded-md" />
                ) : (
                  <span
                    className="w-4 h-4 rounded-full border border-black"
                    style={{ background: COMPANY_COLORS[job.company] || '#000' }}
                  />
                )}
                <span className="text-[15px] font-medium tracking-[0.1em] uppercase text-gray-500">
                  {job.company}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[54px] font-intern tracking-[-3px] leading-[1] text-black mb-6 m-0">
                {job.title}
              </h2>

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap text-[16px] text-gray-500 font-sans mb-8">
                <span>{job.location}</span>
                <span className="text-black">·</span>
                <span>{job.type}</span>
                <span className="text-black">·</span>
                <span>Posted {daysAgo(job.postedAt)}</span>
              </div>

              {/* Referrer badge */}
              <div className="inline-flex items-center gap-2 bg-[#113824] text-white text-[15px] font-sans px-5 py-2.5 rounded-lg border border-black shadow-[3px_4px_0px_0px_#000000] mb-10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {job.availableReferrers} employee referrer{job.availableReferrers !== 1 ? 's' : ''} available
              </div>

              {/* Divider */}
              <div className="h-px bg-black mb-10" />

              {/* CTAs Moved to Top */}
              {!hasApplied ? (
                <div className="flex flex-col gap-4 mb-10">
                  <h3 className="text-[28px] tracking-[-1px] font-medium text-black m-0 leading-none">Apply or Save</h3>
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <button
                      onClick={() => setIsApplying(true)}
                      className="tracking-[-1px] text-white bg-[#113824] border-[1px] border-black py-2.5 px-6 font-sans text-[18px] font-normal rounded-xl shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] cursor-pointer"
                    >
                      Apply with referral ✦
                    </button>
                    <a
                      href={job.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracking-[-1px] text-black bg-white border-[1px] border-black py-2.5 px-6 font-sans text-[18px] font-normal rounded-xl shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] no-underline"
                    >
                      Apply without referral →
                    </a>
                    <button
                      onClick={() => toggleSave(job.id)}
                      className="tracking-[-1px] text-black bg-white border-[1px] border-black py-2.5 px-6 font-sans text-[18px] font-normal rounded-xl shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] cursor-pointer"
                    >
                      {savedJobs.includes(job.id) ? 'Saved ♥' : 'Save Job ♡'}
                    </button>
                  </div>
                  <p className="text-[15px] text-gray-500 font-sans mt-2">
                    Applying with referral checks your resume match before connecting you to a referrer.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-10">
                  <div className="flex gap-4 mt-2 flex-wrap">
                    <button
                      disabled
                      className="tracking-[-1px] text-gray-400 bg-gray-100 border-[1px] border-gray-300 py-2.5 px-6 font-sans text-[18px] font-normal rounded-xl cursor-not-allowed"
                    >
                      Already Applied ✓
                    </button>
                    <button
                      onClick={() => toggleSave(job.id)}
                      className="tracking-[-1px] text-black bg-white border-[1px] border-black py-2.5 px-6 font-sans text-[18px] font-normal rounded-xl shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] cursor-pointer"
                    >
                      {savedJobs.includes(job.id) ? 'Saved ♥' : 'Save Job ♡'}
                    </button>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-black mb-10" />

              {/* JD */}
              <div className="mb-12">
                <h3 className="text-[28px] tracking-[-1px] font-medium text-black mb-6 m-0 leading-none">Job Description</h3>
                <div className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.6] text-justify">
                  {job.jd.split('\n').map((line, i) => {
                    const isTitle = line.trim().endsWith(':');
                    return (
                      <span key={i} className={isTitle ? "block mt-5 mb-2" : ""}>
                        {isTitle ? <strong className="font-semibold text-[19px]">{line}</strong> : line}
                        {!isTitle && <br />}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-[16px]">
              Select a job to view details
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Sticky Column (Referrers or Apply Flow) ───────────────── */}
        <div className="w-[360px] shrink-0 flex flex-col border-l border-black bg-gray-50 overflow-y-auto max-lg:hidden">
          {job ? (
            <div className="p-8">
              {hasApplied ? (
                // State C: Already Applied
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center shadow-[4px_5px_0px_0px_rgba(34,197,94,0.2)]">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <h3 className="text-[18px] tracking-[-0.5px] font-medium text-green-800 mb-1">Already Applied</h3>
                    <p className="text-[14px] text-green-600 leading-tight mb-4">You have submitted a referral request for this role.</p>
                    <Link to="/dashboard" className="inline-block bg-white text-green-700 border border-green-300 font-medium text-[14px] px-4 py-2 rounded-lg hover:bg-green-100 transition-colors no-underline">
                      Track your referral request →
                    </Link>
                  </div>

                  <h3 className="text-[20px] tracking-[-1px] font-medium text-black mb-4">Recommended Jobs</h3>
                  <div className="flex flex-col gap-3">
                    {JOBS.filter(j => j.id !== job.id && !appliedTitles.includes(j.title)).slice(0, 3).map(rec => (
                      <button
                        key={rec.id}
                        onClick={() => handleJobSelect(rec.id)}
                        className="text-left bg-white border border-black p-4 rounded-xl shadow-[2px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getCompanyLogo(rec.company) ? (
                            <img src={getCompanyLogo(rec.company)} alt={rec.company} className="w-4 h-4 object-contain" />
                          ) : (
                            <span className="w-2 h-2 rounded-full" style={{ background: COMPANY_COLORS[rec.company] || '#000' }} />
                          )}
                          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-500">{rec.company}</p>
                        </div>
                        <p className="text-[15px] font-medium text-black tracking-[-0.5px] leading-tight mb-2">{rec.title}</p>
                        <span className="text-[12px] bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md inline-block">{rec.location}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (!isApplying && !currentHistory) ? (
                // State A: Blurred Referrers
                <div>
                  <h3 className="text-[20px] tracking-[-1px] font-medium text-black mb-1">Referrers for {job.company}</h3>
                  <p className="text-[14px] text-gray-500 mb-6 leading-tight">These employees can refer you for this role.</p>
                  
                  <div className="flex flex-col gap-4">
                    {/* Mock blurred referrers */}
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl blur-[4px] opacity-70 pointer-events-none select-none">
                        <div className="w-10 h-10 bg-gray-300 rounded-full" />
                        <div>
                          <div className="w-24 h-4 bg-gray-300 rounded mb-1" />
                          <div className="w-16 h-3 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))}
                    
                    {/* Below CTA */}
                    <div className="mt-2 text-center">
                      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_5px_0px_0px_#000]">
                        <p className="text-[15px] font-medium tracking-[-0.5px] text-black mb-4 leading-tight">Apply with referral to view and request these referrers.</p>
                        <button
                          onClick={() => setIsApplying(true)}
                          className="w-full bg-[#113824] text-white text-[15px] py-2.5 rounded-lg border border-black shadow-[2px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all cursor-pointer"
                        >
                          Unlock Referrers
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // State B: AI Match Flow
                <div>
                  <h3 className="text-[22px] tracking-[-1px] font-medium text-black mb-2 leading-tight">AI Resume Match</h3>
                  <p className="text-[14px] text-gray-500 mb-6 leading-snug">Upload your resume to check how well you match this role.</p>

                  {/* Ported ResumeMatch UI */}
                  {matchState === STATE.IDLE && (
                    currentUser?.resume_filename ? (
                      <div className="border-2 border-black bg-white rounded-xl p-8 flex flex-col items-center gap-4 text-center shadow-[4px_5px_0px_0px_#000]">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        </div>
                        <div>
                          <p className="text-[15px] font-medium text-black tracking-[-0.5px]">Use saved resume</p>
                          <p className="text-[13px] text-gray-500 mt-1 max-w-[200px] truncate" title={currentUser.resume_filename}>{currentUser.resume_filename}</p>
                        </div>
                        <button onClick={() => handleFile(null)} className="w-full bg-[#113824] text-white py-2.5 rounded-lg border border-black shadow-[2px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform cursor-pointer">
                          Match Score
                        </button>
                        <Link to="/dashboard" className="text-[13px] text-gray-500 hover:text-black underline">Update resume in Dashboard</Link>
                      </div>
                    ) : (
                      <div className="border-2 border-black bg-white rounded-xl p-8 flex flex-col items-center gap-4 text-center shadow-[4px_5px_0px_0px_#000]">
                        <p className="text-[15px] font-medium text-black tracking-[-0.5px]">No resume found</p>
                        <p className="text-[13px] text-gray-500 leading-snug">Upload your resume to your profile once, and use it to match with any job.</p>
                        <Link to="/dashboard" className="w-full inline-block bg-[#113824] text-white py-2.5 rounded-lg border border-black shadow-[2px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform no-underline">
                          Go to Dashboard
                        </Link>
                      </div>
                    )
                  )}

                  {matchState === STATE.LOADING && (
                    <div className="border-2 border-black bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-[4px_5px_0px_0px_#000]">
                      <div className="w-8 h-8 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                      <div className="text-center">
                        <p className="text-[15px] font-medium text-black tracking-[-0.5px]">Analysing resume…</p>
                        <p className="text-[12px] text-gray-500 mt-1 truncate max-w-[200px]" title={fileName}>{fileName}</p>
                      </div>
                    </div>
                  )}

                  {matchState === STATE.STRONG && matchResult && (
                    <div className="border-2 border-black bg-white rounded-xl p-6 shadow-[4px_5px_0px_0px_#000]">
                      <ScoreMeter score={matchResult.score} />
                      <h2 className="text-[20px] font-medium tracking-[-1px] text-black text-center mb-2">Strong match ✦</h2>
                      
                      {matchResult.strengths?.length > 0 && (
                        <ul className="flex flex-col gap-1 mb-6">
                          {matchResult.strengths.slice(0,3).map(s => (
                            <li key={s} className="flex items-start gap-2 text-[13px] text-black">
                              <span className="text-green-500 shrink-0">✓</span> <span className="line-clamp-2 leading-snug">{s}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <button onClick={handleRequestReferral} disabled={requesting} className="w-full bg-[#113824] border border-black text-white py-2.5 text-[15px] rounded-lg shadow-[2px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_0px_#000] transition-all cursor-pointer mb-2">
                        {requesting ? 'Submitting...' : 'Request Referral →'}
                      </button>
                      <button onClick={resetMatch} className="w-full text-[13px] text-gray-500 hover:text-black py-1 cursor-pointer">Try another resume</button>
                    </div>
                  )}

                  {matchState === STATE.WEAK && matchResult && (
                    <div className="border-2 border-black bg-white rounded-xl p-6 shadow-[4px_5px_0px_0px_#000]">
                      <ScoreMeter score={matchResult.score} />
                      <h2 className="text-[20px] font-medium tracking-[-1px] text-black text-center mb-2">Weak match</h2>
                      
                      {matchResult.gaps?.length > 0 && (
                        <ul className="flex flex-col gap-1 mb-5">
                          {matchResult.gaps.slice(0,3).map(g => (
                            <li key={g} className="flex items-start gap-2 text-[13px] text-black">
                              <span className="text-red-500 shrink-0">✗</span> <span className="line-clamp-2 leading-snug">{g}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Upgrade Upsell */}
                      <div className="bg-[#f8f9fa] border-2 border-dashed border-gray-300 rounded-xl p-5 mb-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 tracking-wider uppercase rounded-bl-lg">Pro</div>
                        <h4 className="text-[15px] font-medium text-black tracking-[-0.5px] mb-1">AI Resume Tailoring</h4>
                        <p className="text-[13px] text-gray-500 mb-3 leading-snug">Let our AI rewrite your resume specifically for this job description to boost your score.</p>
                        <Link to="/pricing" className="inline-flex w-full justify-center items-center gap-1.5 bg-black text-white text-[13px] py-2 rounded-lg hover:opacity-80 transition-opacity">
                          Upgrade to Pro · $9/mo
                        </Link>
                      </div>

                      <button onClick={resetMatch} className="w-full bg-white border-2 border-gray-200 text-[13px] text-gray-600 hover:border-black hover:text-black py-2 rounded-lg transition-colors cursor-pointer">
                        Try another resume
                      </button>
                    </div>
                  )}

                  {matchState === STATE.ERROR && (
                    <div className="border-2 border-red-200 bg-red-50 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
                      <p className="text-[14px] font-medium text-black">{errorMsg || 'Something went wrong.'}</p>
                      <button onClick={resetMatch} className="text-[13px] text-gray-500 hover:text-black underline cursor-pointer">Try again</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-[14px] p-8 text-center">
              Select a job to view options
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
