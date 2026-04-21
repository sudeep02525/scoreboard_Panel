'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function LoginPage() {
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
      if (res.user.role === 'admin') {
        setError('Use the admin login page instead.');
        setLoading(false);
        return;
      }
      login(res.user, res.token);
      router.push('/dashboard');
    } else {
      setError(res.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#00061C' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4 border-2" style={{ borderColor: '#F3C570' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#F3C570' }}>Cricket Tournament</h1>
          <p className="text-sm mt-1" style={{ color: '#A1BDCB' }}>Login to watch live scores</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          <h2 className="text-lg font-bold mb-5" style={{ color: '#ffffff' }}>Login</h2>

          {error && (
            <p className="text-sm p-3 rounded-lg mb-4" style={{ background: '#1a0a0a', color: '#F9A2B2', border: '1px solid #3a1a1a' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1BDCB' }}>Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                placeholder="you@example.com" />
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
              className="w-full py-2.5 rounded-lg font-bold transition disabled:opacity-50 text-sm mt-2"
              style={{ background: '#F3C570', color: '#00061C' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#A1BDCB' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-bold" style={{ color: '#F3C570' }}>Sign Up</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#1a2a4a' }}>
          Admin?{' '}
          <Link href="/admin/login" style={{ color: '#1a2a4a' }} className="hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
