import { useState, useEffect, useRef } from 'react'; // useRef kept if needed
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
import heroImage from './assets/heroimage.png';

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
  'Your Network. Your Edge.',
  'Less Noise. More Referrals.',
];

export default function App() {
  const headline = useTypewriter(TYPEWRITER_PHRASES);
  const navigate = useNavigate();

  const handleGetReferred = () => {
    const token = localStorage.getItem('token');
    navigate(token ? '/jobs' : '/login');
  };

  return (
    <div style={{ background: '#ffffff', overflow: 'auto' }}>

      {/* Shared navbar — same on every page */}
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="flex flex-col min-h-screen pt-16 "
      >
        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">

          {/* Wrapper to sync image width with title width */}
          <div className="flex flex-col w-max max-w-full items-center">

            {/* Hero Image */}
            <div className="relative w-full h-[220px] mb-10 overflow-hidden rounded-[20px]">
              <style>{`
                @keyframes panImage {
                  0% { object-position: center 0%; }
                  50% { object-position: center 100%; }
                  100% { object-position: center 0%; }
                }
              `}</style>
              <img
                src={heroImage}
                alt="Hero"
                className="w-full h-full object-cover saturate-140 scale-[1.2]"
                style={{ animation: 'panImage 30s ease-in-out infinite' }}
              />
              <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.4)] rounded-[20px] pointer-events-none"></div>
            </div>

            {/* Title Container */}
            <div className="relative w-full flex justify-center mb-4">

              {/* Invisible grid anchor to determine the exact max width and height of all phrases */}
              <div className="invisible pointer-events-none grid text-[96px] tracking-[-4px] font-normal leading-[1] max-lg:text-[64px] max-md:text-[44px] max-md:tracking-[-2px] text-center" aria-hidden="true">
                {TYPEWRITER_PHRASES.map(phrase => (
                  <h1 key={phrase} className="col-start-1 row-start-1 m-0">
                    {phrase}
                  </h1>
                ))}
              </div>

              {/* Visible typewriter text */}
              <h1 className="absolute inset-0 flex items-center justify-center text-[92px] tracking-[-6px] font-normal leading-[1] text-black max-lg:text-[64px] max-md:text-[44px] max-md:tracking-[-2px] text-center m-0">
                <span>{headline}</span>
                <span className="inline-block w-[4px] h-[0.85em] bg-black ml-2 align-middle animate-[blink_0.75s_step-end_infinite]" />
              </h1>
            </div>
          </div>

          {/* Tagline — Inter Italic */}
          <p
            className="text-[28px] tracking-[-1px] text-black mb-8 max-w-[800px] leading-[1.1] text-center italic font-thin"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Candidates hate being ignored. Employees hate being spammed. Referrd makes referrals easier for both.
          </p>

          {/* CTAs */}
          <div className="flex gap-11 mb-10 max-md:flex-col max-md:w-full max-md:max-w-[500px]">
            <Link to="/employee-signup" className="tracking-[-2px] bg-[#00ff00] text-black border-[1px] border-black py-1 px-10 font-sans text-[30px] font-thin rounded-xl cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] no-underline">
              give referral
            </Link>
            <button onClick={handleGetReferred} className="tracking-[-2px] bg-[#00ff00] text-black border-[1px] border-black py-1 px-10 font-sans text-[30px] font-thin rounded-xl cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000]">
              get referred
            </button>
          </div>

          {/* Brand logos */}
          <div className="w-full mb-12">
            <div className="flex items-center gap-5 max-w-[900px] mx-auto mb-10">
              <div className="flex-1 h-[2px]" style={{ backgroundImage: 'linear-gradient(to right, black 50%, transparent 50%)', backgroundSize: '20px 2px', backgroundRepeat: 'repeat-x' }} />
              <p className="text-center text-[20px] font-normal text-black tracking-[-0.5px] whitespace-nowrap opacity-100">
                Trusted by people from leading companies
              </p>
              <div className="flex-1 h-[2px]" style={{ backgroundImage: 'linear-gradient(to right, black 50%, transparent 50%)', backgroundSize: '20px 2px', backgroundRepeat: 'repeat-x' }} />
            </div>
            <div className="flex items-center justify-center gap-12 max-w-[1000px] mx-auto flex-wrap">
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