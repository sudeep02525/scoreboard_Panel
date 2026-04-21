'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const cards = [
  { 
    href: '/admin/teams', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: 'Manage Teams', 
    desc: 'Add/edit 8 teams across Group A & B' 
  },
  { 
    href: '/admin/players', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    label: 'Manage Players', 
    desc: 'Add up to 8 players per team' 
  },
  { 
    href: '/admin/matches', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: 'Manage Matches', 
    desc: 'Schedule, score & complete matches' 
  },
  { 
    href: '/admin/schedule', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    label: 'Generate Schedule', 
    desc: 'Auto-generate group stage fixtures' 
  },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(243, 197, 112, 0.1)', border: '1px solid rgba(243, 197, 112, 0.3)', color: '#F3C570' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
            </svg>
            ADMIN CONTROL CENTER
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ color: '#ffffff' }}>
            Tournament <span style={{ color: '#F3C570' }}>Management</span>
          </h1>
          <p className="text-base" style={{ color: '#A1BDCB' }}>Complete control over teams, players, matches and schedules</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <Link key={c.href} href={c.href}
              className={`group relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-slide-up animate-delay-${(i + 1) * 100}`}
              style={{ 
                background: 'linear-gradient(135deg, rgba(10, 22, 40, 0.8) 0%, rgba(10, 22, 40, 0.6) 100%)',
                border: '1px solid rgba(243, 197, 112, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: 'radial-gradient(circle at top, rgba(243, 197, 112, 0.1), transparent)',
                  pointerEvents: 'none'
                }}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: 'rgba(243, 197, 112, 0.1)',
                    border: '1px solid rgba(243, 197, 112, 0.2)',
                    color: '#F3C570'
                  }}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-base mb-2 transition-colors duration-300" 
                  style={{ color: '#ffffff' }}>
                  {c.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A1BDCB' }}>
                  {c.desc}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: '#F3C570' }}>
                  <span>Open</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
