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

import Lottie from 'lottie-react';
import whyAnimation from './assets/why.json';
import employeeAnimation from './assets/employe.json';
import studentAnimation from './assets/student.json';
import aiAnimation from './assets/ai.json';

const LottieComponent = Lottie.default || Lottie;

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
    <div className="bg-white" style={{ minHeight: '100vh', overflow: 'auto' }}>

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
              <div className="invisible pointer-events-none grid font-snippet text-[96px] tracking-[-4px] font-normal leading-[1] max-lg:text-[64px] max-md:text-[44px] max-md:tracking-[-2px] text-center" aria-hidden="true">
                {TYPEWRITER_PHRASES.map(phrase => (
                  <h1 key={phrase} className="col-start-1 row-start-1 m-0">
                    {phrase}
                  </h1>
                ))}
              </div>

              {/* Visible typewriter text */}
              <h1 className="absolute inset-0 flex items-center justify-center font-intern text-[92px] tracking-[-6px] font-normal leading-[1] text-black max-lg:text-[64px] max-md:text-[44px] max-md:tracking-[-2px] text-center m-0">
                <span>{headline}</span>
                <span className="inline-block w-[4px] h-[0.85em] bg-black ml-2 align-middle animate-[blink_0.75s_step-end_infinite]" />
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <p
            className="text-[28px] tracking-[-1px] text-black mb-8 max-w-[800px] leading-[1.1] text-center font-sans font-light"
          >
            Candidates hate being ignored. Employees hate being spammed. Referrd makes referrals easier for both.
          </p>

          {/* CTAs */}
          <div className="flex gap-11 mb-10 max-md:flex-col max-md:w-full max-md:max-w-[500px]">
            <Link to="/employee-signup" className="tracking-[-2px] text-black border-[1px] border-black py-1 px-10 font-sans text-[30px] font-normal rounded-xl cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] no-underline">
              Give referral
            </Link>
            <button onClick={handleGetReferred} className="tracking-[-2px] text-black border-[1px] border-black py-1 px-10 font-sans text-[30px] font-normal rounded-xl cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000]">
              Get referred
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

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="w-full flex justify-center mb-24 px-6 md:px-12 lg:px-16 pt-20">
        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2">

          {/* Card 1 */}
          <div className="aspect-square bg-[#113824] border border-black flex items-center justify-center">
            <div className="w-[70%] h-[70%]">
              <LottieComponent animationData={whyAnimation} loop={true} />
            </div>
          </div>
          <div className="aspect-square bg-white border border-black flex flex-col justify-center px-12 md:px-20">
            <div className="w-[90%] mx-auto">
              <h3 className="text-[32px] tracking-[-1px] font-medium text-black mb-4 m-0 leading-none">Why Referrd exists</h3>
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify">
                Getting a referral should not depend on who you already know. We built Referrd because the current process is broken, candidates send requests into the void, employees get spammed, and good people get overlooked. There had to be a better way.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="aspect-square bg-white border border-black flex flex-col justify-center px-12 md:px-20 max-md:order-4">
            <div className="w-[90%] mx-auto">
              <h3 className="text-[32px] tracking-[-1px] font-medium text-black mb-4 m-0 leading-none">Active referrers only</h3>
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify">
                Every employee on Referrd is here by choice. They signed up because they want to refer good candidates,not because someone asked them to. So when you send a request, you're not shouting into the void. Someone is actually waiting on the other side.

              </p>
            </div>
          </div>
          <div className="aspect-square bg-[#113824] border border-black flex items-center justify-center max-md:order-3">
            <div className="w-[70%] h-[70%]">
              <LottieComponent animationData={employeeAnimation} loop={true} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="aspect-square bg-[#113824] border border-black flex items-center justify-center max-md:order-5">
            <div className="w-[70%] h-[70%]">
              <LottieComponent animationData={aiAnimation} loop={true} />
            </div>
          </div>
          <div className="aspect-square bg-white border border-black flex flex-col justify-center px-12 md:px-20 max-md:order-6">
            <div className="w-[90%] mx-auto">
              <h3 className="text-[32px] tracking-[-1px] font-medium text-black mb-4 m-0 leading-none">AI filters the noise</h3>
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify">
                Before any request reaches an employee, our AI matches your resume against the job description. Only candidates who genuinely fit the role get through, saving employees time and giving serious candidates a real shot.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="aspect-square bg-white border border-black flex flex-col justify-center px-12 md:px-20 max-md:order-8">
            <div className="w-[90%] mx-auto">
              <h3 className="text-[32px] tracking-[-1px] font-medium text-black mb-4 m-0 leading-none">Built for early careers</h3>
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify">
                Landing your first or second job is the hardest part. Referrd is designed specifically for students and early career professionals who have the skills but not the network, and deserve a fair shot anyway.
              </p>
            </div>
          </div>
          <div className="aspect-square bg-[#113824] border border-black flex items-center justify-center max-md:order-7">
            <div className="w-[70%] h-[70%]">
              <LottieComponent animationData={studentAnimation} loop={true} />
            </div>
          </div>

        </div>
      </section>

      <footer className="w-full flex flex-col pt-16 mt-20">
        <div className="w-full px-6 md:px-12 lg:px-16 mb-12">
          {/* Top border line */}
          <div className="w-full border-t border-black/30 pt-10 flex justify-between items-start max-md:flex-col max-md:gap-10">

            {/* Left side Logo text */}
            <div>
              <h2 className="text-[18vw] xl:text-[250px] leading-[0.8] tracking-[min(-0.5vw,-4px)] mt-5 font-medium text-black m-0">
                Referrd.
              </h2>
            </div>

            {/* Right side Links */}
            <div className="flex gap-16 max-md:flex-wrap max-md:gap-10 mt-7 lg:mr-40 xl:mr-24">
              {/* Product Column */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[18px] font-medium tracking-[-0.5px] text-black mb-1 m-0">Product</h4>
                <Link to="/jobs" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Job openings</Link>
                <Link to="/pricing" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Pricing</Link>
                <a href="/#about" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">About</a>
              </div>

              {/* Account Column */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[18px] font-medium tracking-[-0.5px] text-black mb-1 m-0">Account</h4>
                <Link to="/signup" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Signup</Link>
                <Link to="/login" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Login</Link>
                <Link to="/employee-signup" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Employee Signup</Link>
              </div>

              {/* Legal Column */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[18px] font-medium tracking-[-0.5px] text-black mb-1 m-0">Legal</h4>
                <Link to="#" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Privacy policy</Link>
                <Link to="#" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Terms of service</Link>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Dark Bar */}
        <div className="w-full h-12 bg-[#1a1a1a]"></div>
      </footer>
    </div>
  );
}