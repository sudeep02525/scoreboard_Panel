'use client';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import { api } from '@/lib/api';

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner" />
        <style jsx>{`.spinner { width: 32px; height: 32px; border: 2px solid var(--border-default); border-top-color: var(--gold); border-radius: 50%; animation: s 0.8s linear infinite; } @keyframes s { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchData = async () => {
    const [live, all, stand] = await Promise.all([
      api.get('/matches/live'), api.get('/matches'), api.get('/standings'),
    ]);
    setLiveMatches(Array.isArray(live) ? live : []);
    setAllMatches(Array.isArray(all) ? all : []);
    setStandings(stand.groupA ? stand : { groupA: [], groupB: [] });
    setLoading(false);
  };

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 10000); return () => clearInterval(i); }, []);

  const completed = allMatches.filter((m) => m.status === 'completed');
  const upcoming = allMatches.filter((m) => m.status === 'scheduled');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>

        {/* Welcome card */}
        <div className="card animate-fade-in" style={{
          padding: '28px 32px', marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Image src="/logo.jpeg" alt="Logo" width={52} height={52}
              style={{ borderRadius: '50%', border: '2px solid var(--gold)' }} />
            {liveMatches.length > 0 && (
              <div style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: 'var(--red)', border: '2px solid var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', fontWeight: 800, color: '#fff',
              }}>{liveMatches.length}</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)', marginBottom: '4px' }}>
              Welcome back, {user?.name}!
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {liveMatches.length > 0 ? `${liveMatches.length} match${liveMatches.length > 1 ? 'es' : ''} live right now!` : 'No live matches right now. Check upcoming fixtures.'}
            </p>
          </div>
          {liveMatches.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
              fontSize: '11px', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.08em',
            }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
              LIVE
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
            <style jsx>{`.spinner { width: 32px; height: 32px; border: 2px solid var(--border-default); border-top-color: var(--gold); border-radius: 50%; animation: s 0.8s linear infinite; } @keyframes s { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {activeTab === 'live' && (
              <Section matches={liveMatches}
                emptyIcon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                emptyText="No live matches right now"
                emptySub="Matches will appear here when they start" />
            )}
            {activeTab === 'upcoming' && (
              <Section matches={upcoming}
                emptyIcon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                emptyText="No upcoming matches"
                emptySub="Check back later" />
            )}
            {activeTab === 'results' && (
              <Section matches={completed}
                emptyIcon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                emptyText="No results yet"
                emptySub="Completed matches will appear here" />
            )}
            {activeTab === 'standings' && (
              <div className="animate-fade-in" style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                <StandingsTable teams={standings.groupA} groupName="A" />
                <StandingsTable teams={standings.groupB} groupName="B" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ matches, emptyIcon, emptyText, emptySub }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="card animate-fade-in" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '72px 24px', textAlign: 'center',
      }}>
        <div style={{ marginBottom: '20px', opacity: 0.5 }}>{emptyIcon}</div>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{emptyText}</p>
        <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>{emptySub}</p>
      </div>
    );
  }
  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
      {matches.map((m) => <MatchCard key={m._id} match={m} />)}
    </div>
  );
}
