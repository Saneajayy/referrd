import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

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
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 flex items-center px-6 max-md:px-4">

      {/* Logo */}
      <Link to="/" className="flex items-center shrink-0">
        <img src={logoImg} alt="Referr'd" className="w-11 h-11 object-contain" />
      </Link>

      {/* Nav links — centered */}
      <div className="flex-1 flex justify-center gap-14 items-center max-md:hidden">
        <a
          href="#"
          onClick={handleDashboard}
          className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal transition-opacity hover:opacity-50"
        >
          Dashboard
        </a>
        {[
          { label: 'Job Openings', href: '/jobs' },
          { label: 'Pricing', href: '/pricing' },
        ].map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal transition-opacity hover:opacity-50"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right side — profile avatar or login */}
      <div className="shrink-0 flex items-center">
        {user ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#000', border: '2px solid #000',
                color: '#fff', fontSize: 13, fontWeight: 500,
                letterSpacing: '-0.5px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'box-shadow .2s',
                boxShadow: open ? '0 0 0 3px #00000020' : 'none',
              }}
              aria-label="Profile menu"
            >
              {initials}
            </button>

            {/* Dropdown */}
            {open && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                background: '#fff', border: '2px solid #000', borderRadius: 16,
                boxShadow: '4px 6px 0 #000', minWidth: 200,
                overflow: 'hidden', zIndex: 200,
                animation: 'ddFade .15s ease',
              }}>
                <style>{`@keyframes ddFade { from { opacity:0; transform:translateY(-6px);} to { opacity:1; transform:translateY(0); } }`}</style>



                {/* Menu items */}
                {[
                  { label: 'My Profile', to: user?.role === 'referrer' ? '/employee-dashboard' : '/dashboard' },
                  { label: 'Manage Account', to: '/manage-account' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block', padding: '11px 16px',
                      fontSize: 14, color: '#111', textDecoration: 'none',
                      transition: 'background .15s', letterSpacing: '-0.2px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {item.label}
                  </Link>
                ))}

                <div style={{ borderTop: '1px solid #f0f0f0' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', textAlign: 'left', padding: '11px 16px',
                      fontSize: 14, color: '#ef4444', background: 'none',
                      border: 'none', cursor: 'pointer', letterSpacing: '-0.2px',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </nav>
  );
}
