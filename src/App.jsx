import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Typewriter hook — rAF-based for smooth, jitter-free animation
function useTypewriter(phrases, typingSpeed = 45, deletingSpeed = 25, pauseMs = 1600) {
  const [displayed, setDisplayed] = useState('');
  const state = useRef({
    phraseIdx: 0,
    charIdx: 0,
    deleting: false,
    pausing: false,
    lastTime: null,
    pauseStart: null,
  });
  const rafId = useRef(null);

  useEffect(() => {
    function tick(now) {
      const s = state.current;
      if (s.lastTime === null) s.lastTime = now;
      const elapsed = now - s.lastTime;

      if (s.pausing) {
        if (now - s.pauseStart >= pauseMs) {
          s.pausing = false;
          s.deleting = true;
          s.lastTime = now;
        }
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      const delay = s.deleting ? deletingSpeed : typingSpeed;
      if (elapsed < delay) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      s.lastTime = now;
      const current = phrases[s.phraseIdx];

      if (!s.deleting) {
        if (s.charIdx < current.length) {
          s.charIdx++;
          setDisplayed(current.slice(0, s.charIdx));
        } else {
          s.pausing = true;
          s.pauseStart = now;
        }
      } else {
        if (s.charIdx > 0) {
          s.charIdx--;
          setDisplayed(current.slice(0, s.charIdx));
        } else {
          s.deleting = false;
          s.phraseIdx = (s.phraseIdx + 1) % phrases.length;
        }
      }

      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

// Import assets
import logoImg from './assets/logo.png';
import googleImg from './assets/GOOG.png';
import microsoftImg from './assets/Microsoft_logo.svg.png';
import appleImg from './assets/AAPL.png';
import nvidiaImg from './assets/NVDA.png';
import netflixImg from './assets/NFLX.png';
import spotifyImg from './assets/SPOT.png';
import amazonImg from './assets/AMZN-e9f942e4.png';
import MedusaeBackground from './MedusaeBackground';

const TYPEWRITER_PHRASES = [
  'Get Referred. Not Ignored.',
  'Land the Job. Skip the Queue.',
  'Your Network. Your Edge.',
  'Referrals That Actually Work.',
];

function App() {
  const headline = useTypewriter(TYPEWRITER_PHRASES);

  return (
    <>
      <MedusaeBackground />

      {/* Logo — fixed at extreme top-left of viewport */}
      <div className="fixed top-4 left-4 z-20 flex items-center cursor-pointer">
        <img
          src={logoImg}
          alt="Referr'd Logo"
          className="w-12 h-12 object-contain"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center w-full max-w-[1400px] mx-auto px-16 max-md:px-6">

        {/* Navbar — fixed, same top-4 + h-12 as logo so they share the same horizontal band */}
        <nav className="fixed top-4 left-0 right-0 h-12 z-20 flex justify-center items-center max-md:hidden">
          <div className="flex gap-20">
            <a
              href="#dashboard"
              className="text-[20px] no-underline text-black font-normal transition-opacity duration-200 hover:opacity-60"
            >
              Dashboard
            </a>
            <a
              href="#job-openings"
              className="text-[20px] no-underline text-black font-normal transition-opacity duration-200 hover:opacity-60"
            >
              Job openings
            </a>
            <a
              href="#pricing"
              className="text-[20px] no-underline text-black font-normal transition-opacity duration-200 hover:opacity-60"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-[20px] no-underline text-black font-normal transition-opacity duration-200 hover:opacity-60"
            >
              About
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center text-center w-full pt-16 pb-16">

          {/* Heading */}
          <h1 className="text-[96px] tracking-[-6px] font-normal leading-[1.05] text-black mb-[-4px] max-lg:text-[64px] max-md:text-[48px] max-md:tracking-[-3px] min-h-[2.2em] flex items-center justify-center">
            <span>{headline}</span>
            <span className="inline-block w-[4px] h-[0.85em] bg-black ml-2 align-middle animate-[blink_0.75s_step-end_infinite]"></span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex gap-8 mb-10 max-md:flex-col max-md:w-full max-md:max-w-[280px]">
            <Link
              to="/employee-signup"
              className="tracking-[-2px] bg-white text-black border-2 border-black py-2 px-8 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline"
            >
              give referral
            </Link>
            <Link
              to="/signup"
              className="tracking-[-2px] bg-white text-black border-2 border-black py-2 px-8 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline"
            >
              get referred
            </Link>
          </div>

          {/* Subtext */}
          <div className="text-[28px] mt-2  font-normal cursor-pointer mb-14 transition-opacity duration-200 hover:opacity-80 tracking-[-1px]">
            Over 400+ working professionals from esteemed companies
          </div>

          {/* Brand Logos */}
          <section className="h-20 mt-[-10] flex justify-between items-center w-full max-w-[900px] mx-auto flex-wrap gap-y-8 max-md:justify-center max-md:gap-6">

            <div className="flex items-center justify-center max-md:h-10">
              <img
                src={googleImg}
                alt="Google"
                className="h-full w-auto max-h-[65px] object-contain max-md:max-h-10 mb-14"
              />
            </div>

            <div className="h-16 flex items-center justify-center max-md:h-10">
              <img
                src={microsoftImg}
                alt="Microsoft"
                className="h-full w-auto max-h-[65px] object-contain max-md:max-h-10 mb-14"
              />
            </div>

            <div className="h-16 flex items-center justify-center max-md:h-10">
              <img
                src={appleImg}
                alt="Apple"
                className="h-full w-auto max-h-[65px] object-contain max-md:max-h-10 mb-14"
              />
            </div>

            <div className="h-16 flex items-center justify-center max-md:h-10">
              <img
                src={nvidiaImg}
                alt="Nvidia"
                className="h-full w-auto max-h-[65px] object-contain max-md:max-h-10 mb-14"
              />
            </div>

            <div className="h-16 flex items-center justify-center max-md:h-10">
              <img
                src={netflixImg}
                alt="Netflix"
                className="h-full w-auto max-h-[65px] object-contain max-md:max-h-10 mb-14"
              />
            </div>

            <div className="h-16 flex items-center justify-center max-md:h-10">
              <img
                src={spotifyImg}
                alt="Spotify"
                className="h-full w-auto max-h-[65px] object-contain max-md:max-h-10 mb-14"
              />
            </div>

            <div className="h-16 flex items-center justify-center max-md:h-10">
              <img
                src={amazonImg}
                alt="Amazon"
                className="h-full w-auto max-h-[70px] object-contain max-md:max-h-10 mb-14"
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default App;