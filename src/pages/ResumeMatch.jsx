import { useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { JOBS } from '../data/jobs.js';
import Navbar from '../components/Navbar.jsx';

// ── Score result states
const STATE = { IDLE: 'idle', LOADING: 'loading', STRONG: 'strong', WEAK: 'weak', ERROR: 'error' };

function ScoreMeter({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-3 my-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="50" fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 50}`}
          strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="60" y="65" textAnchor="middle" fontSize="26" fontWeight="normal" fill={color} fontFamily="Inter, sans-serif">
          {score}
        </text>
      </svg>
      <span className="text-[14px] text-gray-400 tracking-[-0.2px]">match score</span>
    </div>
  );
}

export default function ResumeMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = JOBS.find(j => j.id === id);

  const [state, setState] = useState(STATE.IDLE);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[24px] font-normal">Job not found.</p>
        <Link to="/jobs" className="underline text-black text-[16px]">← Back to openings</Link>
      </div>
    );
  }

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please upload a PDF file.');
      setState(STATE.ERROR);
      return;
    }
    setFileName(file.name);
    setState(STATE.LOADING);
    setErrorMsg('');

    const form = new FormData();
    form.append('resume', file);
    form.append('jobId', job.id);

    try {
      const res = await fetch('/api/jobs/match-resume', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Scoring failed.');
      setResult(data);
      setState(data.score >= 60 ? STATE.STRONG : STATE.WEAK);
    } catch (err) {
      setErrorMsg(err.message);
      setState(STATE.ERROR);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setState(STATE.IDLE);
    setResult(null);
    setFileName('');
    setErrorMsg('');
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      {/* Content */}
      <div className="max-w-[620px] mx-auto px-6 pt-24 pb-32">

        {/* Back */}
        <Link to="/jobs"
          className="inline-flex items-center gap-1.5 text-[14px] text-gray-400 no-underline hover:text-black transition-colors mb-10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back to job
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[13px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">{job.company}</p>
          <h1 className="text-[36px] font-normal tracking-[-2px] text-black leading-tight mb-1">{job.title}</h1>
          <p className="text-[16px] text-gray-400">Upload your resume to check how well you match this role.</p>
        </div>

        {/* ── IDLE / DROP ZONE ──────────────────────────────────────────────── */}
        {state === STATE.IDLE && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-14 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200 ${dragOver ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black'}`}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <div className="text-center">
              <p className="text-[17px] font-normal text-black tracking-[-0.5px]">Drop your resume here</p>
              <p className="text-[14px] text-gray-400 mt-1">or click to browse · PDF only · max 10MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* ── LOADING ─────────────────────────────────────────────────────── */}
        {state === STATE.LOADING && (
          <div className="border-2 border-black rounded-2xl p-14 flex flex-col items-center gap-5 shadow-[4px_5px_0px_0px_#000]">
            <div className="w-10 h-10 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-[17px] font-normal text-black tracking-[-0.5px]">Analysing your resume…</p>
              <p className="text-[13px] text-gray-400 mt-1">{fileName}</p>
            </div>
          </div>
        )}

        {/* ── STRONG MATCH (≥ 60) ─────────────────────────────────────────── */}
        {state === STATE.STRONG && result && (
          <div className="border-2 border-black rounded-2xl p-10 shadow-[4px_5px_0px_0px_#000]">
            <ScoreMeter score={result.score} />
            <h2 className="text-[26px] font-normal tracking-[-1.5px] text-black text-center mb-2">
              Strong match ✦
            </h2>
            <p className="text-[15px] text-gray-500 text-center mb-8 leading-[1.5]">{result.summary}</p>

            {result.strengths.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">What matches</p>
                <ul className="flex flex-col gap-2">
                  {result.strengths.map(s => (
                    <li key={s} className="flex items-start gap-2 text-[15px] text-black">
                      <span className="text-green-500 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.gaps.length > 0 && (
              <div className="mb-8">
                <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Minor gaps</p>
                <ul className="flex flex-col gap-2">
                  {result.gaps.map(g => (
                    <li key={g} className="flex items-start gap-2 text-[15px] text-gray-600">
                      <span className="text-amber-500 mt-0.5">△</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              to={`/jobs/${job.id}/referrers`}
              className="w-full bg-black text-white border-2 border-black py-3 text-[18px] font-normal rounded-xl cursor-pointer shadow-[4px_5px_0px_0px_#555] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_7px_0px_0px_#555] no-underline tracking-[-0.5px] mb-3"
            >
              View available referrers →
            </Link>
            <button onClick={reset}
              className="w-full text-[14px] text-gray-400 hover:text-black transition-colors py-2">
              Try a different resume
            </button>
          </div>
        )}

        {/* ── WEAK MATCH (< 60) ───────────────────────────────────────────── */}
        {state === STATE.WEAK && result && (
          <div className="border-2 border-black rounded-2xl p-10 shadow-[4px_5px_0px_0px_#000]">
            <ScoreMeter score={result.score} />
            <h2 className="text-[26px] font-normal tracking-[-1.5px] text-black text-center mb-2">
              Weak match
            </h2>
            <p className="text-[15px] text-gray-500 text-center mb-8 leading-[1.5]">{result.summary}</p>

            {result.gaps.length > 0 && (
              <div className="mb-6">
                <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">What's missing</p>
                <ul className="flex flex-col gap-2">
                  {result.gaps.map(g => (
                    <li key={g} className="flex items-start gap-2 text-[15px] text-black">
                      <span className="text-red-500 mt-0.5">✗</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upgrade upsell */}
            <div className="bg-black rounded-xl p-6 mb-6">
              <p className="text-[13px] font-semibold tracking-[0.1em] uppercase text-white/50 mb-2">Pro feature</p>
              <p className="text-[17px] font-normal text-white tracking-[-0.5px] mb-1">AI Resume Tailoring</p>
              <p className="text-[14px] text-white/60 mb-4 leading-[1.5]">
                Get specific line-by-line suggestions to improve your resume for this exact JD and boost your score above 60.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 bg-white text-black text-[14px] font-medium px-4 py-2 rounded-lg no-underline hover:opacity-80 transition-opacity"
              >
                Upgrade to Pro · $9/mo →
              </Link>
            </div>

            <button onClick={reset}
              className="w-full text-[14px] text-gray-400 hover:text-black transition-colors py-2 border-2 border-gray-200 rounded-xl">
              Try a different resume
            </button>
          </div>
        )}

        {/* ── ERROR ────────────────────────────────────────────────────────── */}
        {state === STATE.ERROR && (
          <div className="border-2 border-red-200 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[17px] font-normal text-black tracking-[-0.5px]">{errorMsg || 'Something went wrong.'}</p>
            <button onClick={reset}
              className="text-[14px] text-gray-400 hover:text-black underline transition-colors">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
