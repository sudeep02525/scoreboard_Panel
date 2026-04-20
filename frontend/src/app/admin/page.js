'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const cards = [
  { href: '/admin/teams', icon: '🏏', label: 'Manage Teams', desc: 'Add/edit 8 teams across Group A & B' },
  { href: '/admin/players', icon: '👤', label: 'Manage Players', desc: 'Add up to 8 players per team' },
  { href: '/admin/matches', icon: '📋', label: 'Manage Matches', desc: 'Schedule, score & complete matches' },
  { href: '/admin/schedule', icon: '🗓️', label: 'Generate Schedule', desc: 'Auto-generate group stage fixtures' },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#00061C' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#F3C570' }}>⚙️ Admin Panel</h1>
        <p className="text-sm mb-8" style={{ color: '#A1BDCB' }}>Manage the cricket tournament</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.href} href={c.href}
              className="rounded-xl p-5 text-center transition hover:scale-105"
              style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="font-semibold text-sm" style={{ color: '#F3C570' }}>{c.label}</p>
              <p className="text-xs mt-1" style={{ color: '#A1BDCB' }}>{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
