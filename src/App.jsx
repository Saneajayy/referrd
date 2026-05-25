import { useState, useEffect, useRef } from 'react'; // useRef kept for typewriter RAF
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// Import assets
import logoImg from './assets/logo.png';
import googleImg from './assets/GOOG.png';
import microsoftImg from './assets/Microsoft_logo.svg.png';
import appleImg from './assets/AAPL.png';
import nvidiaImg from './assets/NVDA.png';
import netflixImg from './assets/NFLX.png';
import spotifyImg from './assets/SPOT.png';
import amazonImg from './assets/AMZN-e9f942e4.png';

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(phrases, typingSpeed = 45, deletingSpeed = 25, pauseMs = 1600) {
  const [displayed, setDisplayed] = useState('');
  const state = useRef({ phraseIdx: 0, charIdx: 0, deleting: false, pausing: false, lastTime: null, pauseStart: null });
  const rafId = useRef(null);

  useEffect(() => {
    function tick(now) {
      const s = state.current;
      if (s.lastTime === null) s.lastTime = now;
      const elapsed = now - s.lastTime;
      if (s.pausing) {
        if (now - s.pauseStart >= pauseMs) { s.pausing = false; s.deleting = true; s.lastTime = now; }
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const delay = s.deleting ? deletingSpeed : typingSpeed;
      if (elapsed < delay) { rafId.current = requestAnimationFrame(tick); return; }
      s.lastTime = now;
      const current = phrases[s.phraseIdx];
      if (!s.deleting) {
        if (s.charIdx < current.length) { s.charIdx++; setDisplayed(current.slice(0, s.charIdx)); }
        else { s.pausing = true; s.pauseStart = now; }
      } else {
        if (s.charIdx > 0) { s.charIdx--; setDisplayed(current.slice(0, s.charIdx)); }
        else { s.deleting = false; s.phraseIdx = (s.phraseIdx + 1) % phrases.length; }
      }
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

const TYPEWRITER_PHRASES = [
  'Get Referred. Not Ignored.',
  'Land the Job. Skip the Queue.',
  'Your Network. Your Edge.',
  'Referrals That Actually Work.',
];

export default function App() {
  const headline = useTypewriter(TYPEWRITER_PHRASES);
  const navigate = useNavigate();

  const handleGetReferred = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/jobs' : '/login');
  };

  return (
    <div style={{ background: '#ffffff', overflow: 'hidden' }}>

      {/* Shared navbar — same on every page */}
      <Navbar />

      {/* ── HERO — full viewport, no scroll ── */}
      <section
        style={{ height: '100vh' }}
        className="flex flex-col"
      >

        {/* Hero content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-6">

          <h1 className="-mb-7 text-[96px] tracking-[-8px] font-normal leading-[1.05] text-black max-lg:text-[64px] max-md:text-[44px] max-md:tracking-[-3px] min-h-[2.2em] flex items-center justify-center">
            <span>{headline}</span>
            <span className="inline-block w-[4px] h-[0.85em] bg-black ml-2 align-middle animate-[blink_0.75s_step-end_infinite]" />
          </h1>

          {/* Tagline — Inter Italic */}
          <p
            className="text-[32px] tracking-[-1px] text-black mb-9  max-w-[850px] leading-[1] text-center italic font-thin"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Candidates hate being ignored. Employees hate being spammed.
            Referrd makes referrals easier for both.
          </p>

          {/* CTAs */}
          <div className="flex gap-14 mb-10 max-md:flex-col max-md:w-full max-md:max-w-[500px]">
            <Link to="/employee-signup" className="tracking-[-1px] bg-white text-black border-2 border-black py-3 px-10 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline">
              give referral
            </Link>
            <button onClick={handleGetReferred} className="tracking-[-1px] bg-white text-black border-2 border-black py-1 px-8 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000]">
              get referred
            </button>
          </div>

          {/* Brand logos — infinite marquee */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-5 max-w-[900px] mx-auto mb-10">
              <div className="flex-1 h-px bg-black opacity-15" />
              <p className="text-center text-[20px] font-normal text-black tracking-[-0.5px] whitespace-nowrap opacity-60">
                Trusted by people from leading companies
              </p>
              <div className="flex-1 h-px bg-black opacity-15" />
            </div>
            <div className="flex items-center justify-center gap-16 max-w-[1000px] mx-auto flex-wrap">
              <img src={googleImg} alt="Google" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              <img src={microsoftImg} alt="Microsoft" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              <img src={appleImg} alt="Apple" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              <img src={nvidiaImg} alt="Nvidia" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              <img src={netflixImg} alt="Netflix" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              <img src={spotifyImg} alt="Spotify" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
              <img src={amazonImg} alt="Amazon" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}