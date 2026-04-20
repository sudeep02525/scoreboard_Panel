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
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold mb-8"
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
        <h1 className="text-5xl md:text-7xl font-black mb-5 leading-tight tracking-tight">
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

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium" style={{ color: '#A1BDCB' }}>
          Live Scoreboard • Real-Time Updates • Complete Match Statistics
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
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
        <div className="flex items-center justify-center gap-10 text-base flex-wrap font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏏</span>
            <span style={{ color: '#A1BDCB' }}>8 Teams</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span style={{ color: '#A1BDCB' }}>64 Players</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span style={{ color: '#A1BDCB' }}>Live Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏟️</span>
            <span style={{ color: '#A1BDCB' }}>2 Grounds</span>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto">
          {[
            { icon: '⚡', title: 'Live Match Scores', desc: 'Ball-by-ball real-time updates' },
            { icon: '📈', title: 'Team Standings', desc: 'Rankings, wins, losses & points' },
            { icon: '🏆', title: 'Tournament Format', desc: 'Groups → Semis → Grand Final' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl backdrop-blur-sm transition-all hover:scale-105 hover:border-opacity-100"
              style={{ 
                background: 'rgba(10, 22, 40, 0.7)', 
                border: '2px solid rgba(243, 197, 112, 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              }}>
              <div className="text-4xl mb-3">{feature.icon}</div>
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
