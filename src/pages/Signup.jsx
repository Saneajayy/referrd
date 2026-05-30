import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import loginSignupImg from '../assets/loginsignup.jpg';
// ── OTP Input sub-component ───────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split('');

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[idx]) {
        next[idx] = '';
      } else if (idx > 0) {
        next[idx - 1] = '';
        inputs.current[idx - 1]?.focus();
      }
      onChange(next.join(''));
    }
  };

  const handleInput = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.slice();
    next[idx] = val;
    onChange(next.join(''));
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={(e) => handleInput(e, idx)}
          onKeyDown={(e) => handleKey(e, idx)}
          disabled={disabled}
          className="w-12 h-14 text-center text-[22px] font-medium rounded-lg border border-black bg-white text-black outline-none focus:ring-1 focus:ring-black transition-colors disabled:opacity-40"
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const STEPS = { FORM: 'form', OTP: 'otp', DONE: 'done' };

export default function Signup() {
  const [step, setStep] = useState(STEPS.FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  function startTimer() {
    setOtpTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setStep(STEPS.OTP);
      startTimer();
      if (data.devOtp) setSuccess(`[DEV] Your OTP is: ${data.devOtp}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP.');
      startTimer(); setOtp('');
      if (data.devOtp) setSuccess(`[DEV] New OTP: ${data.devOtp}`);
      else setSuccess('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP → Signup ─────────────────────────────────────────────
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || 'OTP verification failed.');

      // 2. Signup
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) throw new Error(signupData.message || 'Signup failed.');

      localStorage.setItem('token', signupData.token);
      setStep(STEPS.DONE);
      setTimeout(() => { window.location.href = '/jobs'; }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── FORM ─────────────────────────────────────────────────────────────────────
  const renderForm = () => (
    <form onSubmit={handleSendOTP} className="w-full max-w-[440px] flex flex-col gap-3">

      {/* Full name */}
      <input
        type="text" name="name" value={form.name} onChange={handleChange}
        placeholder="Enter your full name" required
        className="w-full px-5 py-3.5 rounded-lg border border-black bg-white text-[16px] text-black placeholder-gray-400 outline-none focus:ring-1 focus:ring-black transition-colors"
      />

      {/* Email */}
      <input
        type="email" name="email" value={form.email} onChange={handleChange}
        placeholder="Enter your email" required
        className="w-full px-5 py-3.5 rounded-lg border border-black bg-white text-[16px] text-black placeholder-gray-400 outline-none focus:ring-1 focus:ring-black transition-colors"
      />

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'} name="password" value={form.password}
          onChange={handleChange} placeholder="Enter your password" required
          className="w-full px-5 py-3.5 pr-12 rounded-lg border border-black bg-white text-[16px] text-black placeholder-gray-400 outline-none focus:ring-1 focus:ring-black transition-colors"
        />
        <button type="button" onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          aria-label="Toggle password visibility">
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
          )}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm text-center px-2">{error}</p>}

      <button type="submit" disabled={loading}
        className="mt-4 w-full bg-black text-white py-3.5 text-[18px] font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Sending OTP…' : 'Signup'}
      </button>

      <p className="text-center text-[15px] text-gray-700 mt-1">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 hover:underline">Login</Link>{' '}here
      </p>
    </form>
  );

  // ── OTP ──────────────────────────────────────────────────────────────────────
  const renderOTP = () => (
    <form onSubmit={handleVerifyAndSignup} className="w-full max-w-[440px] flex flex-col items-center gap-6">
      <p className="text-[15px] text-gray-600 text-center leading-relaxed">
        Please enter the 6 digit code sent to your email.
      </p>

      <div className="flex items-center gap-3 text-[14px]">
        <button type="button" onClick={handleResendOTP} disabled={otpTimer > 0 || loading}
          className={`transition-colors ${otpTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:underline cursor-pointer'}`}>
          {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend code ?'}
        </button>
        <span className="text-gray-300">·</span>
        <button type="button"
          onClick={() => { setStep(STEPS.FORM); setError(''); setSuccess(''); setOtp(''); }}
          className="text-gray-500 hover:text-black transition-colors">
          Edit your email ?
        </button>
      </div>

      {success && (
        <p className="text-green-600 text-sm text-center px-2 bg-green-50 rounded-lg py-2 w-full">{success}</p>
      )}

      <OTPInput value={otp} onChange={setOtp} disabled={loading} />

      {error && <p className="text-red-500 text-sm text-center px-2">{error}</p>}

      <button type="submit" disabled={loading || otp.length < 6}
        className="w-full bg-black text-white py-3.5 text-[18px] font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Verifying…' : 'Verify'}
      </button>
    </form>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────────
  const renderDone = () => (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="text-[26px] font-normal tracking-[-1px]">You&apos;re all set!</h2>
      <p className="text-gray-500 text-[15px]">Redirecting to your dashboard…</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Split Screen Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={loginSignupImg} alt="Split screen" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 z-20 cursor-pointer">
          <Link to="/">
            <img src={logoImg} alt="Referr'd Logo" className="w-12 h-12 object-contain" />
          </Link>
        </div>
        {/* Bottom Right Text Overlay */}
        <div className="absolute bottom-10 right-12 z-20 pointer-events-none select-none">
          <h1 className="text-[80px] xl:text-[110px] font-medium text-white leading-[0.8] tracking-[-5px]">
            Referrd.
          </h1>
        </div>
      </div>

      {/* Right side: Form Content */}
      <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center px-4 py-12">
        {/* Logo for mobile */}
        <div className="lg:hidden absolute top-4 left-4 z-20 cursor-pointer">
          <Link to="/">
            <img src={logoImg} alt="Referr'd Logo" className="w-12 h-12 object-contain" />
          </Link>
        </div>

        {step === STEPS.FORM && renderForm()}
        {step === STEPS.OTP && renderOTP()}
        {step === STEPS.DONE && renderDone()}
      </div>
    </div>
  );
}
