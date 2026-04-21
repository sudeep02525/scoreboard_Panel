'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await api.post('/auth/login', form);
    if (res.token) {
      if (res.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      login(res.user, res.token);
      router.push('/admin');
    } else {
      setError(res.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fade-in">
          <img src="/logo.jpeg" alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-4 border-2" style={{ borderColor: '#F3C570' }} />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: '#1a2a4a', color: '#F3C570' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
            </svg>
            ADMIN PANEL
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Admin Login</h1>
          <p className="text-xs mt-1" style={{ color: '#A1BDCB' }}>Restricted access only</p>
        </div>

        <div className="rounded-2xl p-6 animate-slide-up animate-delay-100" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          {error && (
            <p className="text-sm p-3 rounded-lg mb-4" style={{ background: '#1a0a0a', color: '#F9A2B2', border: '1px solid #3a1a1a' }}>
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1BDCB' }}>Admin Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                placeholder="admin@cricket.com" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1BDCB' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm pr-10"
                  style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition"
                  style={{ color: '#A1BDCB' }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-bold transition disabled:opacity-50 text-sm"
              style={{ background: '#F3C570', color: '#00061C' }}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#1a2a4a' }}>
          <Link href="/" style={{ color: '#1a2a4a' }} className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
