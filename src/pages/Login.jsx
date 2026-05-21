import { useState } from 'react';
import { Link } from 'react-router-dom';
import MedusaeBackground from '../MedusaeBackground';
import logoImg from '../assets/logo.png';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      // TODO: store token & redirect to dashboard
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MedusaeBackground />

      {/* Logo */}
      <div className="fixed top-4 left-4 z-20 cursor-pointer">
        <Link to="/">
          <img src={logoImg} alt="Referr'd Logo" className="w-12 h-12 object-contain" />
        </Link>
      </div>

      {/* Page */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[440px] flex flex-col gap-3"
        >
          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full px-5 py-3.5 rounded-full border border-gray-300 bg-white text-[16px] text-black placeholder-gray-400 outline-none focus:border-black transition-colors"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-5 py-3.5 pr-12 rounded-full border border-gray-300 bg-white text-[16px] text-black placeholder-gray-400 outline-none focus:border-black transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              )}
            </button>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end pr-1">
            <button
              type="button"
              className="text-[14px] text-gray-500 hover:text-black transition-colors"
            >
              Forgot password ?
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center px-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-white text-black border-2 border-black py-3 text-[22px] font-normal rounded-full cursor-pointer shadow-[4px_6px_0px_0px_#000000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_8px_0px_0px_#000000] active:translate-y-0.5 active:shadow-[2px_3px_0px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>

          {/* Switch to signup */}
          <p className="text-center text-[15px] text-gray-700 mt-1">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Signup
            </Link>{' '}
            here
          </p>
        </form>
      </div>
    </>
  );
}
