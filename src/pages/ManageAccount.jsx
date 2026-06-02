import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/newlogo.png';

function authFetch(url, opts = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}

/* ── Section card ─────────────────────────────────────────────────────────── */
function Card({ children, danger }) {
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${danger ? '#ef4444' : '#000'}`,
      borderRadius: 20,
      padding: '28px 28px',
      boxShadow: `4px 5px 0 ${danger ? '#ef4444' : '#000'}`,
    }}>
      {children}
    </div>
  );
}

/* ── Small label ──────────────────────────────────────────────────────────── */
function Label({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 14, margin: '0 0 14px' }}>
      {children}
    </p>
  );
}

/* ── Input ────────────────────────────────────────────────────────────────── */
function Input({ type = 'text', placeholder, value, onChange, danger }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      <input
        type={isPass && !show ? 'password' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 44px 12px 16px',
          borderRadius: 40, border: `1.5px solid ${danger ? '#ef4444' : '#d1d5db'}`,
          fontSize: 15, color: '#111', outline: 'none',
          background: '#fff', transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = danger ? '#ef4444' : '#000'}
        onBlur={e => e.target.style.borderColor = danger ? '#ef4444' : '#d1d5db'}
      />
      {isPass && (
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
        >
          {show
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          }
        </button>
      )}
    </div>
  );
}

/* ── Status message ───────────────────────────────────────────────────────── */
function StatusMsg({ msg, ok }) {
  if (!msg) return null;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, background: ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`, color: ok ? '#15803d' : '#dc2626', fontSize: 13, marginTop: 12 }}>
      {msg}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function ManageAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Change password state
  const [cpForm, setCpForm] = useState({ current: '', next: '', confirm: '' });
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState({ text: '', ok: false });

  // Delete account state
  const [delPass, setDelPass] = useState('');
  const [delLoading, setDelLoading] = useState(false);
  const [delMsg, setDelMsg] = useState({ text: '', ok: false });
  const [delConfirm, setDelConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      setUser(JSON.parse(atob(token.split('.')[1])));
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  /* ── Change password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCpMsg({ text: '', ok: false });
    if (cpForm.next !== cpForm.confirm) {
      setCpMsg({ text: 'New passwords do not match.', ok: false });
      return;
    }
    if (cpForm.next.length < 8) {
      setCpMsg({ text: 'New password must be at least 8 characters.', ok: false });
      return;
    }
    setCpLoading(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: cpForm.current, newPassword: cpForm.next }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setCpMsg({ text: '✓ Password updated successfully.', ok: true });
      setCpForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setCpMsg({ text: err.message, ok: false });
    } finally {
      setCpLoading(false);
    }
  };

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    if (!delPass) { setDelMsg({ text: 'Please enter your password to confirm.', ok: false }); return; }
    setDelLoading(true);
    try {
      const res = await authFetch('/api/auth/delete-account', {
        method: 'DELETE',
        body: JSON.stringify({ password: delPass }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      localStorage.removeItem('token');
      navigate('/?deleted=1');
    } catch (err) {
      setDelMsg({ text: err.message, ok: false });
    } finally {
      setDelLoading(false);
    }
  };

  if (!user) return null;

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>

      {/* ── Top nav ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={logoImg} alt="Referr'd" style={{ width: 44, height: 44, objectFit: 'contain' }} />
        </Link>
        <span style={{ fontSize: 15, color: '#9ca3af', letterSpacing: '-0.3px' }}>Manage Account</span>
        <Link to="/dashboard" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 20, padding: '6px 16px' }}>
          ← Back
        </Link>
      </header>

      <main style={{ paddingTop: 88, paddingBottom: 60, padding: '88px 24px 60px', maxWidth: 600, margin: '0 auto' }}>

        {/* Profile bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 500, letterSpacing: '-0.5px', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-1px', color: '#000', margin: 0 }}>{displayName}</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{user.email}</p>
          </div>
        </div>

        {/* ── Change Password ── */}
        <div style={{ marginBottom: 16 }}>
          <Card>
            <Label>Change Password</Label>
            <form onSubmit={handleChangePassword}>
              <Input
                type="password"
                placeholder="Current password"
                value={cpForm.current}
                onChange={e => setCpForm(p => ({ ...p, current: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="New password (min. 8 characters)"
                value={cpForm.next}
                onChange={e => setCpForm(p => ({ ...p, next: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={cpForm.confirm}
                onChange={e => setCpForm(p => ({ ...p, confirm: e.target.value }))}
              />
              <StatusMsg msg={cpMsg.text} ok={cpMsg.ok} />
              <button
                type="submit"
                disabled={cpLoading}
                style={{
                  marginTop: 14, width: '100%', padding: '12px',
                  background: '#000', color: '#fff', border: '2px solid #000',
                  borderRadius: 40, fontSize: 15, fontWeight: 400,
                  letterSpacing: '-0.3px', cursor: cpLoading ? 'not-allowed' : 'pointer',
                  opacity: cpLoading ? 0.6 : 1,
                  boxShadow: '3px 4px 0 #000', transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={e => { if (!cpLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '5px 6px 0 #000'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 4px 0 #000'; }}
              >
                {cpLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </Card>
        </div>

        {/* ── Delete Account ── */}
        <Card danger>
          <Label>Danger Zone</Label>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 18, lineHeight: 1.6 }}>
            Deleting your account is <strong>permanent</strong>. All your referral requests, data, and history will be erased and cannot be recovered.
          </p>

          {!delConfirm ? (
            <button
              onClick={() => setDelConfirm(true)}
              style={{
                width: '100%', padding: '12px', background: '#fff',
                color: '#ef4444', border: '2px solid #ef4444',
                borderRadius: 40, fontSize: 15, fontWeight: 400,
                letterSpacing: '-0.3px', cursor: 'pointer',
                boxShadow: '3px 4px 0 #ef4444', transition: 'transform .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              Delete My Account
            </button>
          ) : (
            <div style={{ animation: 'fadeIn .2s ease' }}>
              <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
              <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 10 }}>
                Enter your password to confirm deletion:
              </p>
              <Input
                type="password"
                placeholder="Your password"
                value={delPass}
                onChange={e => setDelPass(e.target.value)}
                danger
              />
              <StatusMsg msg={delMsg.text} ok={delMsg.ok} />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  onClick={() => { setDelConfirm(false); setDelPass(''); setDelMsg({ text: '', ok: false }); }}
                  style={{ flex: 1, padding: '11px', background: '#fff', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 40, fontSize: 14, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={delLoading}
                  style={{
                    flex: 1, padding: '11px', background: '#ef4444',
                    color: '#fff', border: '2px solid #ef4444',
                    borderRadius: 40, fontSize: 14, fontWeight: 500,
                    cursor: delLoading ? 'not-allowed' : 'pointer',
                    opacity: delLoading ? 0.7 : 1,
                    boxShadow: '3px 4px 0 #ef4444',
                  }}
                >
                  {delLoading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </Card>

      </main>
    </div>
  );
}
