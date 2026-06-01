import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function authFetch(url, opts = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
}

const FREE_FEATURES = [
  'Browse all job openings',
  'AI resume JD match scoring',
  'Up to 3 referral requests per job',
  'Track referral request status',
  'Direct apply without referral',
];

const PAID_FEATURES = [
  'AI resume tailoring based on JD',
  'Up to 6 referral requests per job',
  'Priority placement in employee inbox',
  'Detailed skill gap breakdown',
  'Unlimited job applications',
];

function CheckIcon({ color }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5"
      className="shrink-0 mt-0.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Pricing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    authFetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white h-screen overflow-hidden flex flex-col">
      <Navbar />

      {/* Page content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 w-full max-w-[1000px] mx-auto py-6 min-h-0">

        {/* Header */}
        <h1 className="text-[52px] font-medium tracking-[-2px] leading-[1.05] text-black text-center mb-8 max-md:text-[40px] max-md:tracking-[-1.5px]">
          Free to start.<br className="md:hidden" /> $9 to stand out.
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1 max-w-[920px] mx-auto min-h-0">

          {/* Free card */}
          <div className="bg-white border-[1px] border-black rounded-2xl p-8 shadow-[4px_5px_0px_0px_#000] flex flex-col max-md:p-6 min-h-0">
            <div className="mb-6 shrink-0">
              {/* Price + badge row */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-end gap-2">
                  <span className="text-[52px] font-medium tracking-[-2px] leading-none text-black">$0</span>
                  <span className="text-[16px] text-gray-500 mb-2 font-medium tracking-[-0.3px]">/month</span>
                </div>
                <span className="inline-block text-[11px] font-bold tracking-[0.1em] uppercase text-black bg-gray-100 border border-black rounded-[6px] px-2 py-0.5 mt-1 shadow-[1px_1px_0px_0px_#000]">
                  Free
                </span>
              </div>
              <p className="text-[14px] mt-4 text-gray-500 tracking-[-0.3px]">No card required. Always free.</p>
            </div>

            <ul className="flex flex-col gap-2.5 mb-6 flex-1 min-h-0 justify-center">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 bg-gray-50 border-[1px] border-black rounded-xl px-4 py-2.5">
                  <CheckIcon color="#000" />
                  <span className="text-[14px] text-black tracking-[-0.3px] leading-tight font-medium">{f}</span>
                </li>
              ))}
            </ul>

            {!user ? (
              <Link
                to="/signup"
                className="w-full bg-white text-black border-[1px] border-black py-3 text-[16px] font-medium rounded-xl cursor-pointer shadow-[3px_4px_0px_0px_#000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#000] no-underline tracking-[-0.5px]"
              >
                Get started free
              </Link>
            ) : !user.is_pro ? (
              <button disabled className="w-full bg-gray-50 text-gray-500 border-[1px] border-gray-300 py-3 text-[16px] font-medium rounded-xl cursor-not-allowed flex justify-center items-center tracking-[-0.5px]">
                Currently Active
              </button>
            ) : (
              <button disabled className="w-full bg-white text-gray-500 border-[1px] border-gray-300 py-3 text-[16px] font-medium rounded-xl cursor-not-allowed flex justify-center items-center tracking-[-0.5px]">
                Downgrade via billing
              </button>
            )}
          </div>

          {/* Paid card */}
          <div className="bg-[#113824] border-[1px] border-black rounded-2xl p-8 shadow-[4px_5px_0px_0px_#000] flex flex-col max-md:p-6 min-h-0">
            <div className="mb-6 shrink-0">
              {/* Price + badge row */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-end gap-2">
                  <span className="text-[52px] font-medium tracking-[-2px] leading-none text-white">$9</span>
                  <span className="text-[16px] text-emerald-100/70 mb-2 font-medium tracking-[-0.3px]">/month</span>
                </div>
                <span className="inline-block text-[11px] font-bold tracking-[0.1em] uppercase text-black bg-[#a7f3d0] border border-black rounded-[6px] px-2 py-0.5 mt-1 shadow-[1px_1px_0px_0px_#000]">
                  Pro
                </span>
              </div>
              <p className="text-[14px] mt-4 text-[#a7f3d0] opacity-80 tracking-[-0.3px]">Cancel anytime. No hidden fees.</p>
            </div>

            <ul className="flex flex-col gap-2.5 mb-6 flex-1 min-h-0 justify-center">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 bg-[#0a2216] border-[1px] border-black rounded-xl px-4 py-2.5">
                  <CheckIcon color="#a7f3d0" />
                  <span className="text-[14px] text-white tracking-[-0.3px] leading-tight font-medium">{f}</span>
                </li>
              ))}
            </ul>

            {!user ? (
              <Link
                to="/signup"
                className="w-full bg-white text-black border-[1px] border-black py-3 text-[16px] font-medium rounded-xl cursor-pointer shadow-[3px_4px_0px_0px_#000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#000] no-underline tracking-[-0.5px]"
              >
                Upgrade to Pro →
              </Link>
            ) : user.is_pro ? (
              <button disabled className="w-full bg-[#0a2216] text-[#a7f3d0] border-[1px] border-black py-3 text-[16px] font-medium rounded-xl cursor-not-allowed flex justify-center items-center tracking-[-0.5px] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.3)]">
                Currently Active
              </button>
            ) : (
              <button onClick={() => alert('Billing portal not integrated yet.')} className="w-full bg-white text-black border-[1px] border-black py-3 text-[16px] font-medium rounded-xl cursor-pointer shadow-[3px_4px_0px_0px_#000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#000] no-underline tracking-[-0.5px]">
                Upgrade to Pro →
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-[13px] text-gray-500 text-center max-w-[500px] leading-relaxed tracking-[-0.3px] shrink-0">
          All plans include access to the full job board. Pricing is per candidate account.
          Employee accounts are always free.
        </p>
      </div>
    </div>
  );
}
