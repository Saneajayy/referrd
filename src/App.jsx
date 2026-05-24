import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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

// ── Slide-up on scroll hook ───────────────────────────────────────────────────
function useSlideUp(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return {
    ref,
    style: {
      transform: visible ? 'translateY(0)' : 'translateY(56px)',
      opacity: visible ? 1 : 0,
      transition: `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, opacity 0.9s ease ${delay}s`,
    },
  };
}

const TYPEWRITER_PHRASES = [
  'Get Referred. Not Ignored.',
  'Land the Job. Skip the Queue.',
  'Your Network. Your Edge.',
  'Referrals That Actually Work.',
];

const STATS = [
  { value: '400+', label: 'Working professionals' },
  { value: '50+', label: 'Top MNCs covered' },
  { value: '3×', label: 'Higher callback rate' },
  { value: '<48h', label: 'Avg. response time' },
];

const STEPS = [
  { num: '01', title: 'You apply', desc: 'Sign up, share your resume and pick the role you want. No fluff.' },
  { num: '02', title: 'We match you', desc: 'We connect you with a verified employee at your target company.' },
  { num: '03', title: 'They refer you', desc: 'The employee submits an internal referral. Your profile jumps the queue.' },
  { num: '04', title: 'You get called', desc: 'Referred candidates are 3× more likely to get a callback. Go crush it.' },
];

export default function App() {
  const headline = useTypewriter(TYPEWRITER_PHRASES);

  const aboutCard = useSlideUp(0);
  const statsRow   = useSlideUp(0.1);
  const howHeader  = useSlideUp(0.05);
  const step0      = useSlideUp(0);
  const step1      = useSlideUp(0.07);
  const step2      = useSlideUp(0.14);
  const step3      = useSlideUp(0.21);
  const stepRefs   = [step0, step1, step2, step3];
  const ctaSlide   = useSlideUp(0.1);

  return (
    <div style={{ background: '#ffffff' }}>

      {/* Shared navbar — same on every page */}
      <Navbar />

      {/* ── HERO — sticky, stays behind the about panel ── */}
      <section
        style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 1 }}
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
            <Link to="/employee-signup" className="tracking-[-1px] bg-white text-black border-2 border-black py-1 px-8 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline">
              give referral
            </Link>
            <Link to="/signup" className="tracking-[-1px] bg-white text-black border-2 border-black py-1 px-8 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline">
              get referred
            </Link>
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
              <img src={googleImg} alt="Google" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <img src={microsoftImg} alt="Microsoft" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <img src={appleImg} alt="Apple" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <img src={nvidiaImg} alt="Nvidia" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <img src={netflixImg} alt="Netflix" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <img src={spotifyImg} alt="Spotify" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
              <img src={amazonImg} alt="Amazon" style={{ height: '65px', width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30 animate-bounce">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── ABOUT PANEL — slides up over the sticky hero ── */}
      <div
        id="about"
        style={{ position: 'relative', zIndex: 2, background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -28 }}
        className="px-6 pt-16 pb-24 max-w-[1000px] mx-auto"
      >
        {/* Drag pill */}
        <div className="flex justify-center mb-12">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* About card */}
        <div ref={aboutCard.ref} style={aboutCard.style}>
          <div className="bg-white border-2 border-black rounded-3xl p-12 shadow-[8px_10px_0px_0px_#000000] max-md:p-8">
            <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 border border-gray-200 rounded-full px-4 py-1 mb-8">
              About Referr&apos;d
            </span>
            <h2 className="text-[52px] font-normal tracking-[-3px] leading-[1.1] text-black mb-6 max-md:text-[34px] max-md:tracking-[-2px]">
              Referrals are the<br />unfair advantage.<br />
              <span className="text-gray-400">We made them fair.</span>
            </h2>
            <p className="text-[18px] text-gray-500 leading-relaxed max-w-[600px] max-md:text-[16px]">
              Most job applications disappear into the void. Referrals get read, get callbacks,
              get offers. Referr&apos;d bridges the gap between talented candidates and the employees
              who can get them noticed — no awkward cold messages, no fake LinkedIn connections.
              Just a direct line to the inside.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRow.ref}
          style={statsRow.style}
          className="grid grid-cols-4 gap-4 mt-4 max-md:grid-cols-2"
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_5px_0px_0px_#000000]">
              <p className="text-[34px] font-normal tracking-[-2px] text-black max-md:text-[26px]">{s.value}</p>
              <p className="text-[13px] text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div
        id="how-it-works"
        style={{ position: 'relative', zIndex: 2, background: '#fff' }}
        className="px-6 pb-40 max-w-[1000px] mx-auto"
      >
        <div ref={howHeader.ref} style={howHeader.style} className="mb-8">
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 border border-gray-200 rounded-full px-4 py-1">
            How it works
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {STEPS.map((step, i) => (
            <div key={step.num} ref={stepRefs[i].ref} style={stepRefs[i].style}>
              <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[4px_5px_0px_0px_#000000] h-full">
                <span className="text-[12px] font-semibold tracking-[0.15em] text-gray-300 block mb-4">{step.num}</span>
                <h3 className="text-[22px] font-normal tracking-[-1px] text-black mb-2">{step.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div ref={ctaSlide.ref} style={ctaSlide.style} className="mt-10 flex justify-center">
          <Link
            to="/signup"
            className="tracking-[-1px] bg-black text-white border-2 border-black py-3 px-10 text-[20px] font-normal rounded-full shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline"
          >
            Get referred now →
          </Link>
        </div>
      </div>
    </div>
  );
}