'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && user.role === 'admin') router.replace('/admin');
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" />
      <style jsx>{`.spinner { width: 32px; height: 32px; border: 2px solid var(--border-default); border-top-color: var(--gold); border-radius: 50%; animation: s 0.8s linear infinite; } @keyframes s { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(6, 14, 26, 0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Image src="/logo.png" alt="Logo" width={40} height={40} unoptimized
            style={{ borderRadius: '12px', border: '2px solid var(--gold)' }} />
          <div>
            <p style={{ fontWeight: 800, fontSize: '14px', color: 'var(--gold)', letterSpacing: '0.06em' }}>APL SCOREBOARD</p>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>SEASON 8 • 2026</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard" className="btn-gold" style={{ padding: '9px 24px', fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>View Scores</Link>
        </div>
      </nav>

      {/* Subtle bg glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(201, 162, 39, 0.03), transparent 70%)', pointerEvents: 'none' }} />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '160px 24px 80px', textAlign: 'center' }}>

        {/* Badge */}
        <div className="animate-fade-in" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 20px', borderRadius: '20px', marginBottom: '40px',
          border: '1px solid var(--border-default)', fontSize: '11px', fontWeight: 600,
          color: 'var(--gold)', letterSpacing: '0.1em',
        }}>
          <span className="pulse-dot" style={{ width: '6px', height: '6px', background: 'var(--gold)' }} />
          LIVE • SEASON 8
        </div>

        {/* Headline */}
        <h1 className="animate-slide-up animate-delay-100" style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px' }}>
          <span style={{ color: 'var(--text-primary)' }}>Experience the</span><br />
          <span className="glow-text" style={{ color: 'var(--gold)' }}>Ultimate Cricket</span><br />
          <span style={{ color: 'var(--text-primary)' }}>Tournament</span>
        </h1>

        <p className="animate-slide-up animate-delay-200" style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 48px', lineHeight: 1.7 }}>
          Live Scoreboard • Real-Time Updates • Complete Match Statistics
        </p>

        {/* CTAs */}
        <div className="animate-slide-up animate-delay-300" style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '64px' }}>
          <Link href="/dashboard" className="btn-gold" style={{ padding: '14px 36px', fontSize: '14px', textDecoration: 'none', display: 'inline-block', letterSpacing: '0.02em' }}>
            View Live Scores →
          </Link>
          <Link href="/dashboard" className="btn-outline" style={{ padding: '14px 36px', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            Watch Tournament
          </Link>
        </div>

        {/* Stats row */}
        <div className="animate-fade-in animate-delay-400" style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {[
            { v: '8', l: 'Teams' }, { v: '56', l: 'Players' }, { v: '2', l: 'Grounds' }, { v: '∞', l: 'Live Updates' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)' }}>{s.v}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '4px' }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '120px' }}>
          {[
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, title: 'Live Match Scores', desc: 'Ball-by-ball real-time updates with instant score refresh' },
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: 'Team Standings', desc: 'Complete rankings, win/loss records & net run rates' },
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>, title: 'Tournament Format', desc: 'Groups → Semi Finals → Grand Final knockout stage' },
          ].map((f, i) => (
            <div key={i} className={`card animate-slide-up animate-delay-${(i+1)*100}`} style={{ padding: '32px 24px', textAlign: 'left' }}>
              <div style={{ marginBottom: '20px', width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(201, 162, 39, 0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', marginTop: '80px', color: 'var(--text-dim)' }}>
          Tournament Admin? <Link href="/admin/login" style={{ color: 'var(--text-dim)', textDecoration: 'underline' }}>Access Control Panel</Link>
        </p>
      </div>
    </div>
  );
}
