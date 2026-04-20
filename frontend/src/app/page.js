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
    // If already logged in, redirect to appropriate dashboard
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Show landing page only if not logged in
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#00061C' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#F3C570', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (user) return null; // Will redirect via useEffect

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #F3C570, transparent)' }}></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #A1BDCB, transparent)' }}></div>

      {/* Main content */}
      <div className="text-center max-w-lg relative z-10">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <Image src="/logo.jpeg" alt="Tournament Logo" width={140} height={140}
            className="rounded-full mx-auto border-4 shadow-2xl"
            style={{ borderColor: '#F3C570' }} />
        </div>

        {/* Tournament Name */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight"
            style={{ color: '#F3C570', textShadow: '0 2px 10px rgba(243, 197, 112, 0.3)' }}>
            Cricket Tournament
          </h1>
          <p className="text-base md:text-lg" style={{ color: '#A1BDCB' }}>
            Live Scoreboard • 8 Teams • 2 Groups
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-sm">
            <span className="px-3 py-1 rounded-full" style={{ background: '#0A1628', color: '#F3C570', border: '1px solid #1a2a4a' }}>
              🏏 Group Stage
            </span>
            <span className="px-3 py-1 rounded-full" style={{ background: '#0A1628', color: '#F3C570', border: '1px solid #1a2a4a' }}>
              🏆 Semi Finals
            </span>
            <span className="px-3 py-1 rounded-full" style={{ background: '#0A1628', color: '#F3C570', border: '1px solid #1a2a4a' }}>
              ⭐ Final
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/register">
            <button className="w-full max-w-xs py-3.5 rounded-xl font-bold text-base transition-all hover:scale-105 shadow-lg"
              style={{ background: '#F3C570', color: '#00061C' }}>
              🎯 Sign Up to Watch Live
            </button>
          </Link>
          
          <Link href="/login">
            <button className="w-full max-w-xs py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: '#0A1628', color: '#A1BDCB', border: '1px solid #1a2a4a' }}>
              Already have an account? Login
            </button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-10 text-xs">
          <div className="p-3 rounded-lg" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
            <div className="text-2xl mb-1">🔴</div>
            <p className="font-semibold" style={{ color: '#ffffff' }}>Live Scores</p>
            <p style={{ color: '#A1BDCB' }}>Real-time</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
            <div className="text-2xl mb-1">📊</div>
            <p className="font-semibold" style={{ color: '#ffffff' }}>Standings</p>
            <p style={{ color: '#A1BDCB' }}>Live table</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
            <div className="text-2xl mb-1">📋</div>
            <p className="font-semibold" style={{ color: '#ffffff' }}>Fixtures</p>
            <p style={{ color: '#A1BDCB' }}>Schedule</p>
          </div>
        </div>

        {/* Admin link - subtle */}
        <p className="text-xs mt-8" style={{ color: '#1a2a4a' }}>
          Tournament Admin?{' '}
          <Link href="/admin/login" className="hover:underline" style={{ color: '#1a2a4a' }}>
            Login here
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
