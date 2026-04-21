'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminMatches() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else loadMatches();
  }, [loading, user]);

  const loadMatches = () => api.get('/matches').then((d) => { if (Array.isArray(d)) setMatches(d); });

  const setStatus = async (id, status) => {
    await api.put(`/matches/${id}`, { status });
    loadMatches();
  };

  const statusColor = { 
    live: { color: '#F9A2B2', bg: 'rgba(249, 162, 178, 0.1)' }, 
    scheduled: { color: '#A1BDCB', bg: 'rgba(161, 189, 203, 0.1)' }, 
    completed: { color: '#1a2a4a', bg: 'rgba(26, 42, 74, 0.1)' } 
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 animate-fade-in" style={{ color: '#F3C570' }}>Manage Matches</h1>

        {matches.length === 0 ? (
          <div className="rounded-xl p-6 text-center animate-slide-up animate-delay-100" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
            <p style={{ color: '#A1BDCB' }}>No matches yet. <Link href="/admin/schedule" className="underline" style={{ color: '#F3C570' }}>Generate schedule first</Link></p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m, i) => (
              <div key={m._id} className={`rounded-xl p-4 flex items-center justify-between gap-4 animate-slide-up animate-delay-${Math.min((i + 1) * 100, 400)}`}
                style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#ffffff' }}>{m.teamA?.name} vs {m.teamB?.name}</p>
                  <p className="text-xs" style={{ color: '#A1BDCB' }}>{m.group} • {m.ground} • Round {m.round || '-'}</p>
                </div>
                <span className="text-xs font-semibold capitalize px-2 py-1 rounded"
                  style={{ color: statusColor[m.status].color, background: statusColor[m.status].bg }}>
                  {m.status}
                </span>
                <div className="flex gap-2">
                  {m.status === 'scheduled' && (
                    <button onClick={() => setStatus(m._id, 'live')}
                      className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
                      style={{ background: '#F9A2B2', color: '#00061C' }}>
                      Start Live
                    </button>
                  )}
                  {m.status === 'live' && (
                    <Link href={`/admin/matches/${m._id}/score`}
                      className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
                      style={{ background: '#F3C570', color: '#00061C' }}>
                      Update Score
                    </Link>
                  )}
                  {m.status !== 'completed' && (
                    <Link href={`/admin/matches/${m._id}/complete`}
                      className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-90 font-bold"
                      style={{ background: '#A1BDCB', color: '#00061C' }}>
                      Complete
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
