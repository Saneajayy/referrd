import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

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

function Input({ label, value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <div className="mb-5">
      <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full p-3 rounded-xl border-[1px] border-black text-[15px] outline-none font-sans transition-shadow ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-black focus:shadow-[2px_3px_0px_0px_#000]'}`}
      />
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    linkedin: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    
    authFetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { localStorage.removeItem('token'); navigate('/login'); return; }
        setUser(d.user);
        setForm({
          name: d.user.name || '',
          email: d.user.email || d.user.work_email || '', // Depending on role
          college: d.user.college || '',
          linkedin: d.user.linkedin || ''
        });
      })
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', ok: false });

    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          college: form.college,
          linkedin: form.linkedin
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setMsg({ text: 'Profile updated successfully!', ok: true });
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── Top nav ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-black flex items-center justify-between px-6 h-16 shadow-[0_2px_0px_0px_#000]">
        <Link to="/" className="flex items-center no-underline">
          <img src={logoImg} alt="Referr'd" className="w-[44px] h-[44px] object-contain" />
        </Link>
        <span className="text-[15px] text-black font-medium tracking-[-0.3px]">Edit Profile</span>
        <Link to={user.role === 'referrer' ? '/employee-dashboard' : '/dashboard'} className="text-[14px] text-black font-medium no-underline border border-black rounded-full px-4 py-1.5 hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
          ← Back
        </Link>
      </header>

      <main className="pt-28 pb-20 px-6 max-w-[500px] mx-auto">
        <h1 className="text-[32px] font-medium tracking-[-1px] text-black mb-6 leading-none">Your Profile</h1>
        
        <div className="bg-white border-[1px] border-black rounded-2xl p-8 shadow-[4px_5px_0px_0px_#000]">
          <form onSubmit={handleSave}>
            <Input 
              label="Full Name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Ajay Kumar" 
            />
            
            <Input 
              label="Email Address" 
              value={form.email} 
              disabled={true} 
            />
            
            <Input 
              label="College / University" 
              value={form.college} 
              onChange={e => setForm({ ...form, college: e.target.value })} 
              placeholder="e.g. IIIT Una" 
            />
            
            <Input 
              label="LinkedIn URL" 
              value={form.linkedin} 
              onChange={e => setForm({ ...form, linkedin: e.target.value })} 
              placeholder="https://linkedin.com/in/username" 
            />

            {msg.text && (
              <div className={`p-3 rounded-lg mb-4 text-[14px] font-medium border ${msg.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`mt-4 w-full bg-[#113824] text-white border-[1px] border-black rounded-xl py-3 px-4 text-[16px] font-medium shadow-[3px_4px_0px_0px_#000] transition-all cursor-pointer ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_0px_#000]'}`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
               <Link to="/manage-account" className="text-[13px] text-gray-500 hover:text-black font-medium no-underline underline-offset-4 hover:underline">
                 Advanced Account Settings (Change Password)
               </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
