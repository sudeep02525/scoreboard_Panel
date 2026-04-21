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
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#00061C' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#F3C570', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 px-8 py-3 flex items-center justify-between z-50 backdrop-blur-md"
        style={{ background: 'rgba(0, 6, 28, 0.9)', borderBottom: '1px solid rgba(26, 42, 74, 0.3)' }}>
        <div className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="Logo" width={40} height={40} className="rounded-lg border-2"
            style={{ borderColor: '#F3C570' }} />
          <div>
            <p className="font-black text-sm tracking-wide" style={{ color: '#F3C570' }}>APL SCOREBOARD</p>
            <p className="text-xs font-medium" style={{ color: '#A1BDCB' }}>SEASON 8 • 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="px-5 py-2 rounded-lg font-semibold transition hover:opacity-80"
            style={{ color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }}>
            Login
          </Link>
          <Link href="/register" className="px-5 py-2 rounded-lg font-bold transition hover:scale-105"
            style={{ background: '#F3C570', color: '#00061C' }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #F3C570, transparent)' }}></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #A1BDCB, transparent)' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-3"
        style={{ background: 'radial-gradient(circle, #F3C570, transparent)' }}></div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center min-h-[85vh] flex flex-col justify-center items-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold mb-8 animate-fade-in"
          style={{ 
            background: 'rgba(243, 197, 112, 0.06)', 
            border: '1px solid rgba(243, 197, 112, 0.3)', 
            color: '#F3C570',
            width: 'fit-content'
          }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#F3C570' }}></span>
          LIVE • SEASON 8 • CRICKET SCOREBOARD
        </div>

        {/* Hero text */}
        <h1 className="text-5xl md:text-7xl font-black mb-5 leading-tight tracking-tight animate-slide-up animate-delay-100">
          <span style={{ color: '#ffffff' }}>WITNESS THE</span>
          <br />
          <span style={{ 
            color: '#F3C570', 
            textShadow: '0 0 50px rgba(243, 197, 112, 0.5), 0 0 100px rgba(243, 197, 112, 0.3)',
            letterSpacing: '0.02em'
          }}>ULTIMATE</span>
          <br />
          <span style={{ color: '#ffffff' }}>CRICKET TOURNAMENT</span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium animate-slide-up animate-delay-200" style={{ color: '#A1BDCB' }}>
          Live Scoreboard • Real-Time Updates • Complete Match Statistics
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-slide-up animate-delay-300">
          <Link href="/register">
            <button className="px-10 py-3.5 rounded-xl font-black text-base transition-all hover:scale-105 shadow-2xl w-64 tracking-wide"
              style={{ 
                background: 'linear-gradient(135deg, #F3C570 0%, #F8DB7D 100%)', 
                color: '#00061C',
                boxShadow: '0 15px 50px rgba(243, 197, 112, 0.4)'
              }}>
              Sign Up to Watch →
            </button>
          </Link>
          
          <Link href="/login">
            <button className="px-10 py-3.5 rounded-xl font-bold text-base transition-all hover:scale-105 w-64 flex items-center justify-center gap-3"
              style={{ 
                background: 'rgba(161, 189, 203, 0.08)', 
                color: '#A1BDCB', 
                border: '2px solid rgba(161, 189, 203, 0.25)' 
              }}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              View Live Scores
            </button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-10 text-base flex-wrap font-semibold animate-fade-in animate-delay-400">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#F3C570' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ color: '#A1BDCB' }}>8 Teams</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#F3C570' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ color: '#A1BDCB' }}>64 Players</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#F3C570' }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span style={{ color: '#A1BDCB' }}>Live Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#F3C570' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ color: '#A1BDCB' }}>2 Grounds</span>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto">
          {[
            { 
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ), 
              title: 'Live Match Scores', 
              desc: 'Ball-by-ball real-time updates' 
            },
            { 
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="16"/>
                </svg>
              ), 
              title: 'Team Standings', 
              desc: 'Rankings, wins, losses & points' 
            },
            { 
              icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              ), 
              title: 'Tournament Format', 
              desc: 'Groups → Semis → Grand Final' 
            },
          ].map((feature, i) => (
            <div key={i} className={`p-6 rounded-2xl backdrop-blur-sm transition-all hover:scale-105 hover:border-opacity-100 animate-slide-up animate-delay-${(i + 1) * 100}`}
              style={{ 
                background: 'rgba(10, 22, 40, 0.7)', 
                border: '2px solid rgba(243, 197, 112, 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              }}>
              <div className="mb-3" style={{ color: '#F3C570' }}>{feature.icon}</div>
              <h3 className="font-black text-lg mb-2 tracking-wide" style={{ color: '#F3C570' }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A1BDCB' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Admin link */}
        <p className="text-xs mt-16" style={{ color: '#1a2a4a' }}>
          Tournament Admin?{' '}
          <Link href="/admin/login" className="hover:underline transition" style={{ color: '#1a2a4a' }}>
            Access Control Panel
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
