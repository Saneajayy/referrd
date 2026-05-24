import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const FREE_FEATURES = [
  'Browse all job openings',
  'AI resume JD match scoring',
  'Up to 3 referral requests per job',
  'Track referral request status in dashboard',
  'Direct apply without referral',
];

const PAID_FEATURES = [
  'AI resume tailoring based on JD',
  'Up to 6 referral requests per job',
  'Priority placement in employee inbox',
  'Detailed skill gap breakdown',
  'Unlimited job applications',
];

function CheckIcon({ filled }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={filled ? 'white' : 'black'} strokeWidth="2.5"
      className="shrink-0 mt-0.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <Navbar />

      {/* Page content */}
      <div className="flex flex-col items-center px-6 pt-24 pb-28 max-w-[1000px] mx-auto">

        {/* Header */}

        <h1 className="text-[72px] font-normal mt-10 tracking-[-5px] leading-[1.05] text-black text-center mb-10 max-md:text-[44px] max-md:tracking-[-3px]">
          Free to start. $9 to stand out.
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-6 w-full max-md:grid-cols-1">

          {/* Free card */}
          <div className="bg-white border-2 border-black rounded-3xl p-10 shadow-[6px_8px_0px_0px_#000000] flex flex-col max-md:p-8">
            <div className="mb-8">
              {/* Price + badge row */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-end gap-2">
                  <span className="text-[52px] font-normal tracking-[-3px] leading-none text-black">$0</span>
                  <span className="text-[18px] text-gray-400 mb-2">/month</span>
                </div>
                <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 border border-gray-200 rounded-full px-3 py-0.5 mt-1">
                  Free
                </span>
              </div>
              <p className="text-[14px] mt-5 text-gray-400">No card required. Always free.</p>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckIcon filled={false} />
                  <span className="text-[16px] text-black leading-[1.4]">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full bg-white text-black border-2 border-black py-3 text-[20px] font-normal rounded-full cursor-pointer shadow-[4px_5px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_7px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline tracking-[-0.5px]"
            >
              Get started free
            </Link>
          </div>

          {/* Paid card */}
          <div className="bg-black border-2 border-black rounded-3xl p-10 shadow-[6px_8px_0px_0px_#555555] flex flex-col max-md:p-8">
            <div className="mb-8">
              {/* Price + badge row */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-end gap-2">
                  <span className="text-[52px] font-normal tracking-[-3px] leading-none text-white">$9</span>
                  <span className="text-[18px] text-white/40 mb-2">/month</span>
                </div>
                <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50 border border-white/20 rounded-full px-3 py-0.5 mt-1">
                  Pro
                </span>
              </div>
              <p className="text-[14px] mt-5 text-white/40">Cancel anytime. No hidden fees.</p>
            </div>

            <ul className="flex flex-col gap-4 mb-10 flex-1">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckIcon filled={true} />
                  <span className="text-[16px] text-white/85 leading-[1.4]">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/signup"
              className="w-full bg-white text-black border-2 border-white py-3 text-[20px] font-normal rounded-full cursor-pointer shadow-[4px_5px_0px_0px_#555555] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_7px_0px_0px_#555555] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#555555] no-underline tracking-[-0.5px]"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-14 text-[15px] text-gray-400 text-center max-w-[500px] leading-relaxed">
          All plans include access to the full job board. Pricing is per candidate account.
          Employee accounts are always free.
        </p>
      </div>
    </div>
  );
}
