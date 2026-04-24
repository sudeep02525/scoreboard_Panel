'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
      if (res.user.role !== 'admin') { setError('Access denied. Admin accounts only.'); setLoading(false); return; }
      login(res.user, res.token);
      router.push('/admin');
    } else {
      setError(res.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Image src="/logo.png" alt="Logo" width={64} height={64} unoptimized
            style={{ borderRadius: '50%', margin: '0 auto 20px', display: 'block' }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px',
            borderRadius: '6px', background: 'rgba(201, 162, 39, 0.06)', border: '1px solid var(--border-default)',
            fontSize: '10px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: '16px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            ADMIN PANEL
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Admin Login</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Restricted access only</p>
        </div>

        <div className="card animate-slide-up animate-delay-100" style={{ padding: '32px' }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--red)', fontSize: '13px' }}>{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Admin Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="admin@cricket.com" />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field" style={{ paddingRight: '44px' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {showPassword
                      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold"
              style={{ width: '100%', padding: '14px', fontSize: '14px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', marginTop: '28px', color: 'var(--text-dim)' }}>
          <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'underline' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
