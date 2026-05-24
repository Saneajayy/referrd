import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = JOBS.find(j => j.id === id);

  const handleDashboard = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  };

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[24px] font-normal tracking-[-1px]">Job not found.</p>
        <Link to="/jobs" className="text-black underline text-[16px]">← Back to openings</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      {/* Content */}
      <div className="max-w-[760px] mx-auto px-6 pt-24 pb-32">

        {/* Back */}
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-[14px] text-gray-400 no-underline hover:text-black transition-colors mb-10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          All openings
        </Link>

        {/* Header */}
        <div className="mb-10">
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

          <h1 className="text-[52px] font-normal tracking-[-3px] leading-[1.05] text-black mb-5 max-md:text-[34px] max-md:tracking-[-2px]">
            {job.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap text-[14px] text-gray-400 mb-5">
            <span>{job.location}</span>
            <span className="text-gray-200">·</span>
            <span>{job.type}</span>
            <span className="text-gray-200">·</span>
            <span>Posted {daysAgo(job.postedAt)}</span>
          </div>

          {/* Referrer count badge */}
          <div className="inline-flex items-center gap-2 bg-black text-white text-[13px] px-4 py-2 rounded-full font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {job.availableReferrers} employee referrer{job.availableReferrers !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-black opacity-10 mb-10" />

        {/* Job description */}
        <div className="mb-14">
          <h2 className="text-[20px] font-normal tracking-[-0.5px] text-black mb-5">Job Description</h2>
          <div className="text-[16px] text-gray-700 leading-[1.75] whitespace-pre-line">
            {job.jd}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-black opacity-10 mb-10" />

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-gray-400 tracking-[-0.2px]">
            How would you like to apply?
          </p>
          <div className="flex gap-4 flex-wrap">
            {/* Apply WITH referral */}
            <Link
              to={`/jobs/${job.id}/apply`}
              className="bg-black text-white border-2 border-black py-3 px-8 text-[18px] font-normal rounded-xl cursor-pointer shadow-[4px_5px_0px_0px_#555] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_7px_0px_0px_#555] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#555] no-underline tracking-[-0.5px]"
            >
              Apply with referral ✦
            </Link>
            {/* Apply WITHOUT referral — external link */}
            <a
              href={job.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black border-2 border-black py-3 px-8 text-[18px] font-normal rounded-xl cursor-pointer shadow-[4px_5px_0px_0px_#000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_7px_0px_0px_#000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000] no-underline tracking-[-0.5px]"
            >
              Apply without referral →
            </a>
          </div>
          <p className="text-[12px] text-gray-400 mt-1">
            Applying with referral checks your resume match before connecting you to a referrer.
          </p>
        </div>
      </div>
    </div>
  );
}
