import { useState, useEffect, useRef } from 'react'; // useRef kept if needed
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// Import assets
import logoImg from './assets/newlogo.png';
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
import hero0Animation from './assets/hero0.json';

const LottieComponent = Lottie.default || Lottie;

// ScrambleText removed

export default function App() {
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
      <section className="relative flex flex-col min-h-screen pt-20 px-6 md:px-12 lg:px-16 pb-8 overflow-hidden">


        <div className="flex flex-col lg:flex-row items-center justify-between max-w-[1300px] mx-auto w-full gap-8 lg:gap-40 flex-1 relative z-10">

          {/* Left content */}
          <div className="flex-1 flex flex-col items-start text-left w-full max-w-[650px]">
            {/* Title */}
            <h1 className="font-intern font-bold leading-[0.9] text-black m-0 mb-4">
              <span className="block text-[90px] lg:text-[140px] tracking-[-4px] lg:tracking-[-5px]">
                <span className="mb-8 italic pr-2">Referrals</span>
              </span>
              <span className="block leading-[0.3] text-[60px] font-light lg:text-[95px] tracking-[-2px] lg:tracking-[-3px] whitespace-nowrap lg:mt-4">
                Made Simple.
                <span className="inline-block w-[4px] h-[0.8em] bg-[#113824] ml-3 lg:ml-4 align-middle animate-[blink_0.75s_step-end_infinite]" />
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-[20px] lg:text-[23px] tracking-[-0.5px] text-black mt-5 mb-6 max-w-[700px] leading-[1.3] font-sans font-light">
              Candidates waste weeks chasing the wrong people.
              Employees get spammed by people they can't help.
              Referrd connects the ones who should've met sooner.
            </p>

            {/* CTAs */}
            <div className="flex gap-6 max-md:flex-col mt-6 w-full max-w-[450px]">
              <Link to="/employee-signup" className="flex-1 tracking-[-0.9px] text-black bg-white border-[1px] border-black py-3.5 px-6 font-sans text-[23px] font-light rounded-xl cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] no-underline hover:bg-gray-50">
                Give referral &rarr;
              </Link>
              <button onClick={handleGetReferred} className="flex-1 tracking-[-0.9px] text-black bg-white border-[1px] border-black py-3.5 px-6 font-sans text-[23px] font-light rounded-xl cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[3px_4px_0px_0px_#000000] hover:bg-gray-50">
                Get referred &rarr;
              </button>
            </div>
          </div>

          {/* Right Image/Animation */}
          <div className="flex-1 w-full max-w-[650px] flex justify-center items-center relative transform scale-[1.1] lg:scale-[1.3] origin-center">
            <LottieComponent animationData={hero0Animation} loop={true} />
          </div>
        </div>

        {/* Feature List Bottom Bar */}

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
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify max-w-[450px]">
                Getting a referral should not depend on who you already know. We built Referrd because the current process is broken, candidates send requests into the void, employees get spammed, and good people get overlooked. There had to be a better way.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="aspect-square bg-white border border-black flex flex-col justify-center px-12 md:px-20 max-md:order-4">
            <div className="w-[90%] mx-auto">
              <h3 className="text-[32px] tracking-[-1px] font-medium text-black mb-4 m-0 leading-none">Active referrers only</h3>
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify max-w-[450px]">
                Every employee on Referrd is here by choice. They signed up because they want to refer good candidates. So when you send a request, you're not shouting into the void. Someone is actually waiting on the other side.

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
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify max-w-[450px]">
                Every referral request on Referrd goes through an AI filter first. Your resume gets scored against the job description, and only strong matches get through. Less noise for employees, better odds for candidates who are actually ready.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="aspect-square bg-white border border-black flex flex-col justify-center px-12 md:px-20 max-md:order-8">
            <div className="w-[90%] mx-auto">
              <h3 className="text-[32px] tracking-[-1px] font-medium text-black mb-4 m-0 leading-none">Built for early careers</h3>
              <p className="text-[17px] tracking-[-0.5px] font-normal text-black leading-[1.2] m-0 text-justify max-w-[450px]">
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

              <p className="text-[14px] mt-4 text-black tracking-[-0.3px]">
                &copy; 2026 Referrd. All rights reserved. Made by Ajay Kumar.
              </p>
            </div>

            {/* Right side Links */}
            <div className="flex gap-16 max-md:flex-wrap max-md:gap-10 mt-7 lg:mr-40 xl:mr-24">
              {/* Product Column */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[18px] font-medium tracking-[-0.5px] text-black mb-1 m-0">Product</h4>
                <Link to="/jobs" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Job openings</Link>
                <Link to="/pricing" className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline">Pricing</Link>
                <a
                  href="/#about"
                  onClick={(e) => {
                    const el = document.getElementById('about');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', '/#about');
                    }
                  }}
                  className="text-[15px] tracking-[-0.5px] text-black/80 hover:text-black no-underline"
                >
                  About
                </a>
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
      </footer>
    </div>
  );
}