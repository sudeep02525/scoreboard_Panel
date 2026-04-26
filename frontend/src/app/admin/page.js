'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ teams: 0, players: 0, matches: 0, live: 0 });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get('/teams'), api.get('/players'), api.get('/matches')]).then(([teams, players, matches]) => {
      setStats({
        teams: Array.isArray(teams) ? teams.length : 0,
        players: Array.isArray(players) ? players.length : 0,
        matches: Array.isArray(matches) ? matches.length : 0,
        live: Array.isArray(matches) ? matches.filter(x => x.status === 'live').length : 0,
      });
    });
  }, [user]);

  if (loading || !user) return null;

  const statCards = [
    { label: 'Teams', value: stats.teams, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'Players', value: stats.players, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { label: 'Matches', value: stats.matches, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { label: 'Live Now', value: stats.live, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stats.live > 0 ? 'var(--red)' : 'var(--text-muted)'} strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  ];

  const actions = [
    { href: '/admin/matches', label: 'Manage Matches', sub: 'Score & complete matches', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { href: '/admin/schedule', label: 'Generate Schedule', sub: 'Create fixtures & knockouts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { href: '/admin/teams', label: 'Manage Teams', sub: 'Add/edit teams across groups', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { href: '/admin/players', label: 'Manage Players', sub: 'Add up to 7 players per team', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Live tournament overview & quick actions</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(201, 162, 39, 0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                {s.label === 'Live Now' && stats.live > 0 && <span className="pulse-dot" />}
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', marginTop: '8px', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {actions.map((a) => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(201, 162, 39, 0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{a.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>{a.label} →</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{a.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
