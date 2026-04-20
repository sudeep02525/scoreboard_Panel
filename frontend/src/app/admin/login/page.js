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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#00061C' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-4 border-2" style={{ borderColor: '#F3C570' }} />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: '#1a2a4a', color: '#F3C570' }}>
            ⚙️ ADMIN PANEL
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>Admin Login</h1>
          <p className="text-xs mt-1" style={{ color: '#A1BDCB' }}>Restricted access only</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
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
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-bold transition disabled:opacity-50 text-sm"
              style={{ background: '#F3C570', color: '#00061C' }}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#1a2a4a' }}>
          Not admin?{' '}
          <Link href="/register" style={{ color: '#1a2a4a' }} className="hover:underline">Go to Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
