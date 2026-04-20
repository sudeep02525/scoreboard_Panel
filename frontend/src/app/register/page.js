'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await api.post('/auth/register', form);
    if (res.token) {
      login(res.user, res.token);
      router.push('/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#00061C' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4 border-2" style={{ borderColor: '#F3C570' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#F3C570' }}>Cricket Tournament</h1>
          <p className="text-sm mt-1" style={{ color: '#A1BDCB' }}>Create your account to watch live scores</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          <h2 className="text-lg font-bold mb-5" style={{ color: '#ffffff' }}>Sign Up</h2>

          {error && (
            <p className="text-sm p-3 rounded-lg mb-4" style={{ background: '#1a0a0a', color: '#F9A2B2', border: '1px solid #3a1a1a' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#A1BDCB' }}>Full Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                placeholder="Your name" />
            </div>
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
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
                placeholder="Min 6 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-bold transition disabled:opacity-50 text-sm mt-2"
              style={{ background: '#F3C570', color: '#00061C' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#A1BDCB' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold" style={{ color: '#F3C570' }}>Login</Link>
          </p>
        </div>

        {/* Admin link — subtle */}
        <p className="text-center text-xs mt-6" style={{ color: '#1a2a4a' }}>
          Admin?{' '}
          <Link href="/admin/login" style={{ color: '#1a2a4a' }} className="hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
