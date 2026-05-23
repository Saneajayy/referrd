import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode JWT payload (no verification — just display)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch {
      // Token malformed — clear and redirect
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const roleLabel = user?.role === 'employee' ? 'Employee · Referrer' : 'Candidate · Job Seeker';

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>

      {/* ── Top nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-6 h-16">
        <Link to="/">
          <img src={logoImg} alt="Referr'd Logo" className="w-10 h-10 object-contain" />
        </Link>
        <span className="text-[15px] font-normal text-gray-500 tracking-tight">Dashboard</span>
        <button
          onClick={handleLogout}
          className="text-[14px] text-gray-500 hover:text-black transition-colors border border-gray-200 rounded-full px-4 py-1.5"
        >
          Log out
        </button>
      </header>

      {/* ── Content ── */}
      <main className="pt-24 pb-20 px-6 max-w-[780px] mx-auto">

        {/* Profile card */}
        <div className="bg-white border-2 border-black rounded-3xl p-10 shadow-[6px_8px_0px_0px_#000000] flex flex-col items-center text-center gap-4 mb-6">

          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white text-[34px] font-normal tracking-tight select-none"
          >
            {initials}
          </div>

          <div>
            <h1 className="text-[32px] font-normal tracking-[-2px] text-black leading-tight">
              {displayName}
            </h1>
            <p className="text-[15px] text-gray-400 mt-1">{user?.email}</p>
          </div>

          {/* Role badge */}
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 border border-gray-200 rounded-full px-4 py-1">
            {roleLabel}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_5px_0px_0px_#000000]">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">Email</p>
            <p className="text-[17px] text-black tracking-tight break-all">{user?.email ?? '—'}</p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_5px_0px_0px_#000000]">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">Account type</p>
            <p className="text-[17px] text-black tracking-tight capitalize">{user?.role ?? 'candidate'}</p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_5px_0px_0px_#000000]">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">Member since</p>
            <p className="text-[17px] text-black tracking-tight">
              {user?.iat
                ? new Date(user.iat * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_5px_0px_0px_#000000]">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <p className="text-[17px] text-black tracking-tight">Active</p>
            </div>
          </div>
        </div>

        {/* CTA based on role */}
        <div className="mt-6 flex justify-center">
          {user?.role === 'employee' ? (
            <Link
              to="/employee-login"
              className="tracking-[-1px] bg-black text-white border-2 border-black py-3 px-10 text-[18px] font-normal rounded-full shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline"
            >
              Give a referral →
            </Link>
          ) : (
            <Link
              to="/signup"
              className="tracking-[-1px] bg-black text-white border-2 border-black py-3 px-10 text-[18px] font-normal rounded-full shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] no-underline"
            >
              Browse referrals →
            </Link>
          )}
        </div>

      </main>
    </div>
  );
}
