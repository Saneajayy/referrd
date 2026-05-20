import React from 'react';

// Import assets
import logoImg from './assets/logo.png';
import googleImg from './assets/GOOG.png';
import microsoftImg from './assets/Microsoft_logo.svg.png';
import appleImg from './assets/AAPL.png';
import nvidiaImg from './assets/NVDA.png';
import netflixImg from './assets/NFLX.png';
import spotifyImg from './assets/SPOT.png';
import amazonImg from './assets/AMZN-e9f942e4.png';

function App() {
  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-[1400px] mx-auto px-16 py-10 max-md:px-6">
      {/* Navbar */}
      <nav className="relative flex justify-center items-center w-full pb-5 max-md:flex-col max-md:pt-5 max-md:pb-5">
        <div className="absolute left-0 flex items-center cursor-pointer max-md:static max-md:mb-5">
          <img src={logoImg} alt="Referr'd Logo" className="w-12 h-12 object-contain" />
        </div>
        <div className="flex gap-16 max-md:gap-6 max-md:flex-wrap max-md:justify-center">
          <a href="#dashboard" className="no-underline text-black text-lg font-normal transition-opacity duration-200 hover:opacity-60">Dashboard</a>
          <a href="#job-openings" className="no-underline text-black text-lg font-normal transition-opacity duration-200 hover:opacity-60">Job openings</a>
          <a href="#pricing" className="no-underline text-black text-lg font-normal transition-opacity duration-200 hover:opacity-60">Pricing</a>
          <a href="#about" className="no-underline text-black text-lg font-normal transition-opacity duration-200 hover:opacity-60">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center w-full my-auto max-md:mt-15">
        <h1 className="text-[88px] font-normal leading-[1.1] tracking-[-3px] text-black mb-10 max-lg:text-[64px] max-lg:tracking-[-2px] max-md:text-[48px] max-md:tracking-[-1px]">
          Get Referred. Not Ignored.
        </h1>

        {/* Call to Actions */}
        <div className="flex gap-8 mb-10 max-md:flex-col max-md:w-full max-md:max-w-[280px]">
          <button className="bg-white text-black border-2 border-black py-4 px-10 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000]">
            give referral
          </button>
          <button className="bg-white text-black border-2 border-black py-4 px-10 font-sans text-[26px] font-normal rounded-lg cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex justify-center items-center hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000]">
            get referred
          </button>
        </div>

        {/* Link Subtext */}
        <div className="text-[#0056b3] text-[22px] font-normal underline cursor-pointer mb-14 transition-opacity duration-200 hover:opacity-80">
          Over 400+ working professionals from prestigious firms
        </div>

        {/* Brand Logos */}
        <section className="flex justify-center items-center flex-wrap gap-12 w-full max-md:gap-6">
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Google">
            <img src={googleImg} alt="Google" className="h-full w-auto max-h-[54px] object-contain max-md:max-h-10" />
          </div>
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Microsoft">
            <img src={microsoftImg} alt="Microsoft" className="h-full w-auto max-h-[48px] object-contain max-md:max-h-10" />
          </div>
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Apple">
            <img src={appleImg} alt="Apple" className="h-full w-auto max-h-[58px] object-contain max-md:max-h-10" />
          </div>
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Nvidia">
            <img src={nvidiaImg} alt="Nvidia" className="h-full w-auto max-h-[58px] object-contain max-md:max-h-10" />
          </div>
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Netflix">
            <img src={netflixImg} alt="Netflix" className="h-full w-auto max-h-[52px] object-contain max-md:max-h-10" />
          </div>
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Spotify">
            <img src={spotifyImg} alt="Spotify" className="h-full w-auto max-h-[52px] object-contain max-md:max-h-10" />
          </div>
          <div className="h-16 flex items-center justify-center max-md:h-10" aria-label="Amazon">
            <img src={amazonImg} alt="Amazon" className="h-full w-auto max-h-[60px] object-contain max-md:max-h-10" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
