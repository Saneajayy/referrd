import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JOBS } from '../data/jobs.js';
import Navbar from '../components/Navbar.jsx';

const COMPANY_COLORS = {
  Google:    '#4285F4',
  Microsoft: '#00A4EF',
  Nvidia:    '#76B900',
  Amazon:    '#FF9900',
  Netflix:   '#E50914',
  Spotify:   '#1DB954',
  Apple:     '#555555',
};

function daysAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

export default function JobOpenings() {
  const [selectedId, setSelectedId] = useState(JOBS[0]?.id ?? null);
  const job = JOBS.find(j => j.id === selectedId);

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      <Navbar />

      {/* Two-panel layout below navbar */}
      <div className="flex h-[calc(100vh-64px)] mt-16 max-w-[1280px] mx-auto gap-0">

        {/* ── LEFT PANEL: Job list ─────────────────────────────────────────── */}
        <div className="w-[380px] shrink-0 flex flex-col border-r border-black/8 bg-white overflow-hidden max-md:w-full">

          {/* List header */}
          <div className="px-5 pt-6 pb-4 border-b border-black/8">
            <h1 className="text-[22px] font-normal tracking-[-1px] text-black">Job Openings</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {JOBS.length} openings · referrals at every company
            </p>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {JOBS.map((j) => {
              const active = j.id === selectedId;
              return (
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  style={{
                    borderColor: active ? (COMPANY_COLORS[j.company] || '#000') : '#000',
                    boxShadow: active
                      ? `4px 5px 0px 0px ${COMPANY_COLORS[j.company] || '#000'}`
                      : '4px 5px 0px 0px #000000',
                  }}
                  className="w-full text-left rounded-2xl p-5 border-2 bg-white transition-all duration-150 hover:-translate-y-0.5"
                >
                  {/* Company */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: COMPANY_COLORS[j.company] || '#000' }}
                    />
                    <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400">
                      {j.company}
                    </span>
                  </div>
                  {/* Title */}
                  <p className="text-[15px] leading-tight mb-2 tracking-[-0.3px] font-normal text-black">
                    {j.title}
                  </p>
                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <span className="text-[12px] text-gray-400">{j.location}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-[12px] text-gray-400">{daysAgo(j.postedAt)}</span>
                  </div>
                  {/* Referrer pill */}
                  <div className="inline-flex items-center gap-1 bg-black text-white text-[11px] px-2 py-0.5 rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            <div className="max-w-[720px] mx-auto px-10 py-10">

              {/* Company + color */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: COMPANY_COLORS[job.company] || '#000' }}
                />
                <span className="text-[13px] font-semibold tracking-[0.12em] uppercase text-gray-400">
                  {job.company}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[44px] font-normal tracking-[-2.5px] leading-[1.05] text-black mb-5">
                {job.title}
              </h2>

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap text-[14px] text-gray-400 mb-5">
                <span>{job.location}</span>
                <span className="text-gray-200">·</span>
                <span>{job.type}</span>
                <span className="text-gray-200">·</span>
                <span>Posted {daysAgo(job.postedAt)}</span>
              </div>

              {/* Referrer badge */}
              <div className="inline-flex items-center gap-2 bg-black text-white text-[13px] px-4 py-2 rounded-full font-medium mb-8">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {job.availableReferrers} employee referrer{job.availableReferrers !== 1 ? 's' : ''} available
              </div>

              {/* Divider */}
              <div className="h-px bg-black/8 mb-8" />

              {/* JD */}
              <div className="mb-12">
                <h3 className="text-[17px] font-normal tracking-[-0.3px] text-black mb-5">Job Description</h3>
                <div className="text-[15px] text-gray-600 leading-[1.8] whitespace-pre-line">
                  {job.jd}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/8 mb-8" />

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <p className="text-[13px] text-gray-400">How would you like to apply?</p>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    to={`/jobs/${job.id}/apply`}
                    className="bg-black text-white border-2 border-black py-2.5 px-7 text-[16px] font-normal rounded-xl inline-flex items-center shadow-[3px_4px_0px_0px_#555] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_6px_0px_0px_#555] no-underline tracking-[-0.3px]"
                  >
                    Apply with referral ✦
                  </Link>
                  <a
                    href={job.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black border-2 border-black py-2.5 px-7 text-[16px] font-normal rounded-xl inline-flex items-center shadow-[3px_4px_0px_0px_#000] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_6px_0px_0px_#000] no-underline tracking-[-0.3px]"
                  >
                    Apply without referral →
                  </a>
                </div>
                <p className="text-[12px] text-gray-400">
                  Applying with referral checks your resume match before connecting you to a referrer.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-[16px]">
              Select a job to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
