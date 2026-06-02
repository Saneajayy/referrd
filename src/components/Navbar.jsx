import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/newlogo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  // Decode token on mount (and when storage changes)
  useEffect(() => {
    function readToken() {
      const token = localStorage.getItem('token');
      if (!token) { setUser(null); return; }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch {
        setUser(null);
      }
    }
    readToken();
    window.addEventListener('storage', readToken);
    return () => window.removeEventListener('storage', readToken);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDashboard = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    navigate(user.role === 'referrer' ? '/employee-dashboard' : '/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 flex items-center justify-between px-6 max-md:px-4">

      {/* Logo */}
      <Link to="/" className="flex items-center shrink-0 relative z-10">
        <img src={logoImg} alt="Referr'd" className="w-11 h-11 object-contain" />
      </Link>

      {/* Nav links — absolutely centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center gap-14 items-center max-md:hidden w-max">
        {!user && (
          <Link
            to="/"
            className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal relative after:absolute after:bottom-[0px] after:left-0 after:h-[1.5px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
          >
            Home
          </Link>
        )}
        <a
          href="#"
          onClick={handleDashboard}
          className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal relative after:absolute after:bottom-[0px] after:left-0 after:h-[1.5px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
        >
          Dashboard
        </a>
        {[
          { label: 'Job openings', href: '/jobs' },
          { label: 'Pricing', href: '/pricing' },
          ...(!user ? [{ label: 'About', href: '/#about' }] : []),
        ].map(({ label, href }) => (
          href.startsWith('/#') ? (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                const targetId = href.replace('/#', '');
                const elem = document.getElementById(targetId);
                if (elem) {
                  e.preventDefault();
                  elem.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState(null, '', href);
                }
              }}
              className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal relative after:absolute after:bottom-[0px] after:left-0 after:h-[1.5px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
            >
              {label}
            </a>
          ) : (
            <Link
              key={label}
              to={href}
              className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal relative after:absolute after:bottom-[0px] after:left-0 after:h-[1.5px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
            >
              {label}
            </Link>
          )
        ))}
      </div>

      {/* Right side — profile avatar or login */}
      <div className="shrink-0 flex items-center relative z-10">
        {user ? (
          <div ref={dropRef} className="flex items-center">
            {/* Horizontal slider for options */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                open ? 'max-w-[300px] opacity-100 mr-4' : 'max-w-0 opacity-0 mr-0'
              } hover:bg-gray-50`}
            >
              <div className="flex items-center gap-6 whitespace-nowrap">
                <Link
                  to="/manage-account"
                  onClick={() => setOpen(false)}
                  className="text-[15px] text-gray-500 hover:text-black transition-colors no-underline tracking-[-0.3px]"
                >
                  Edit profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[15px] text-red-400 hover:text-red-500 transition-colors tracking-[-0.3px] bg-transparent border-none p-0 cursor-pointer hover:bg-gray-50"
                >
                  Log out
                </button>
              </div>
            </div>

            {/* Avatar button */}
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-50"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#000',
                color: '#fff',
                fontSize: 13, fontWeight: 500,
                letterSpacing: '-0.5px', border: 'none'
              }}
              aria-label="Profile menu"
            >
              {initials}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              style={{
                fontSize: 14, color: '#000', textDecoration: 'none',
                border: '1.5px solid #000', borderRadius: 20,
                padding: '6px 16px', letterSpacing: '-0.3px',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000'; }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              style={{
                fontSize: 14, color: '#fff', background: '#000', textDecoration: 'none',
                border: '1.5px solid #000', borderRadius: 20,
                padding: '6px 16px', letterSpacing: '-0.3px',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
