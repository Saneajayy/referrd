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
      <section className="relative flex flex-col min-h-screen overflow-hidden bg-white">

        {/* Background blobs */}
        <div className="absolute top-[-80px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[#d6eeff] opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute top-[-80px] left-[-120px] w-[420px] h-[420px] rounded-full backdrop-blur-md pointer-events-none" />

        <div className="absolute top-[20px] right-[-80px] w-[340px] h-[340px] rounded-full bg-[#d6eeff] opacity-50 blur-3xl pointer-events-none" />
        <div className="absolute top-[20px] right-[-80px] w-[340px] h-[340px] rounded-full backdrop-blur-md pointer-events-none" />



        {/* Top-left cross */}
        <div className="absolute top-[20%] left-[8%] right-[25%] h-[1px] bg-black/20 pointer-events-none" />
        <div className="absolute top-[16%] left-[12%] w-[1px] h-[12%] bg-black/20 pointer-events-none" />

        {/* Bottom-right cross */}
        <div className="absolute bottom-[31%] left-[20%] right-[6%] h-[1px] bg-black/20 pointer-events-none" />
        <div className="absolute bottom-[27%] right-[21%] w-[1px] h-[12%] bg-black/20 pointer-events-none" />

        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-8 md:px-14 lg:px-20 pt-28 pb-16">

          {/* Heading block */}
          <div className="relative max-w-[1200px] w-full mx-auto">

            {/* Line 1 — YOUR NEXT */}
            <h1 className="font-inter font-bold uppercase leading-[0.88] tracking-[-1px] text-[clamp(64px,11vw,130px)] text-black m-0">
              <span
                style={{ filter: "blur(3px)", opacity: 1 }}
              >
                YO
              </span>
              <span style={{ filter: "blur(2px)", opacity: 1 }}>UR </span>
              <span>NEXT</span>
            </h1>

            {/* Line 2 — JOB STARTS WITH A + tagline floated right */}
            <div className="relative">
              <h2 className="font-inter font-bold whitespace-nowrap uppercase leading-[0.88] tracking-[-3px] text-[clamp(64px,11vw,130px)] text-black m-0">
                JOB STARTS WITH A
              </h2>

              {/* Tagline — sits to the right, vertically centered on this line */}
              <p className="absolute right-[-80px] text-[13px] top-[-110px] lg:text-[28px]  text-black/70 leading-[1.2] font-light text-left max-w-[700px] hidden lg:block">
                Candidates hate being ignored.<br />
                Employees hate being spammed.<br />
                Referrd makes referrals easier for both.
              </p>
            </div>

            {/* Line 3 — RIGHT REFERRAL (outline style) */}
            <h3
              className="font-inter font-thin uppercase text-center leading-[0.88] tracking-[-3px] text-[clamp(64px,8.5vw,130px)] m-0"
              style={{ WebkitTextStroke: "2px black" }}
            >
              RIGHT{" "}
              <span className="relative inline-block border border-[#0018F9] px-3">
                REFERRAL
                {/* Corner dots */}
                <span className="absolute top-0 left-0 w-2 h-2 bg-[#0018F9] rounded-full -translate-x-1/2 -translate-y-1/2" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#0018F9] rounded-full translate-x-1/2 -translate-y-1/2" />
                <span className="absolute bottom-0 left-0 w-2 h-2 bg-[#0018F9] rounded-full -translate-x-1/2 translate-y-1/2" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#0018F9] rounded-full translate-x-1/2 translate-y-1/2" />
              </span>
            </h3>

            {/* Tagline for mobile (below heading) */}
            <p className="lg:hidden text-[16px] text-black/70 leading-[1.6] font-light mt-6">
              Candidates hate being ignored.<br />
              Employees hate being spammed.<br />
              Referrd makes referrals easier for both.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-14 mt-[130px] mb-1 justify-center max-w-[1200px] mx-auto w-full">
            <button
              onClick={handleGetReferred}
              className="px-6 py-2 text-[30px] font-light text-white bg-[#113824] border border-black shadow-[2px_3px_0px_0px_#000000] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[4px_6px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] cursor-pointer"
            >
              Get referred
            </button>

            <Link
              to="/employee-signup"
              className="px-6 py-2 text-[30px] font-light text-white bg-[#113824] border border-black shadow-[2px_3px_0px_0px_#000000] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[4px_6px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline inline-flex items-center cursor-pointer"
            >
              Give referral
            </Link>
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