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
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <img src={logoImg} alt="Referr'd Logo" className="logo-icon" />
        </div>
        <div className="nav-links">
          <a href="#dashboard" className="nav-link">Dashboard</a>
          <a href="#job-openings" className="nav-link">Job openings</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <h1 className="hero-title">Get Referred. Not Ignored.</h1>

        {/* Call to Actions */}
        <div className="buttons-container">
          <button className="btn-neobrutalist">give referral</button>
          <button className="btn-neobrutalist">get referred</button>
        </div>

        {/* Link Subtext */}
        <div className="subtext-link">
          Over 400+ working professionals from prestigious firms
        </div>

        {/* Brand Logos */}
        <section className="companies-container">
          <div className="company-logo" aria-label="Google">
            <img src={googleImg} alt="Google" />
          </div>
          <div className="company-logo" aria-label="Microsoft">
            <img src={microsoftImg} alt="Microsoft" />
          </div>
          <div className="company-logo" aria-label="Apple">
            <img src={appleImg} alt="Apple" />
          </div>
          <div className="company-logo" aria-label="Nvidia">
            <img src={nvidiaImg} alt="Nvidia" />
          </div>
          <div className="company-logo" aria-label="Netflix">
            <img src={netflixImg} alt="Netflix" />
          </div>
          <div className="company-logo" aria-label="Spotify">
            <img src={spotifyImg} alt="Spotify" />
          </div>
          <div className="company-logo" aria-label="Amazon">
            <img src={amazonImg} alt="Amazon" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
