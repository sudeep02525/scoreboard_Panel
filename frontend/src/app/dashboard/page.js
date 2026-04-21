'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import { api } from '@/lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [live, all, stand] = await Promise.all([
      api.get('/matches/live'),
      api.get('/matches'),
      api.get('/standings'),
    ]);
    setLiveMatches(Array.isArray(live) ? live : []);
    setAllMatches(Array.isArray(all) ? all : []);
    setStandings(stand.groupA ? stand : { groupA: [], groupB: [] });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds for live scores
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const completedMatches = allMatches.filter((m) => m.status === 'completed');
  const upcomingMatches = allMatches.filter((m) => m.status === 'scheduled');

  const tabs = [
    { 
      key: 'live', 
      label: 'Live',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8"/>
        </svg>
      ),
      count: liveMatches.length 
    },
    { 
      key: 'upcoming', 
      label: 'Upcoming',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      count: upcomingMatches.length 
    },
    { 
      key: 'results', 
      label: 'Results',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      count: completedMatches.length 
    },
    { 
      key: 'standings', 
      label: 'Standings',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
      ),
      count: null 
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #00061C 0%, #000D27 50%, #001333 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4 animate-fade-in"
        style={{ background: 'linear-gradient(135deg, #000D27 0%, #0A1628 100%)', border: '1px solid #1a2a4a' }}>
        <Image src="/logo.jpeg" alt="Logo" width={56} height={56} className="rounded-full border-2 flex-shrink-0" style={{ borderColor: '#F3C570' }} />
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: '#F3C570' }}>
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#A1BDCB' }}>
            {liveMatches.length > 0
              ? `${liveMatches.length} match${liveMatches.length > 1 ? 'es' : ''} live right now!`
              : 'No live matches right now. Check upcoming fixtures.'}
          </p>
        </div>
        {liveMatches.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#F9A2B2', color: '#00061C' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-700 animate-pulse inline-block"></span>
            LIVE
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 animate-slide-up animate-delay-100">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300"
            style={activeTab === t.key
              ? { background: '#F3C570', color: '#00061C' }
              : { background: '#0A1628', color: '#A1BDCB', border: '1px solid #1a2a4a' }}>
            {t.icon}
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={activeTab === t.key
                  ? { background: '#00061C', color: '#F3C570' }
                  : { background: '#1a2a4a', color: '#F3C570' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#F3C570', borderTopColor: 'transparent' }}></div>
        </div>
      ) : (
        <>
          {activeTab === 'live' && (
            <div className="animate-fade-in">
              {liveMatches.length === 0 ? (
                <EmptyState 
                  icon={
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  }
                  text="No live matches right now" 
                  sub="Matches will appear here when they start" 
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {liveMatches.map((m, i) => (
                    <div key={m._id} className={`animate-slide-up animate-delay-${(i % 2) * 100}`}>
                      <MatchCard match={m} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="animate-fade-in">
              {upcomingMatches.length === 0 ? (
                <EmptyState 
                  icon={
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  }
                  text="No upcoming matches scheduled" 
                  sub="Check back later" 
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {upcomingMatches.map((m, i) => (
                    <div key={m._id} className={`animate-slide-up animate-delay-${(i % 2) * 100}`}>
                      <MatchCard match={m} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="animate-fade-in">
              {completedMatches.length === 0 ? (
                <EmptyState 
                  icon={
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  }
                  text="No results yet" 
                  sub="Completed matches will appear here" 
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {completedMatches.map((m, i) => (
                    <div key={m._id} className={`animate-slide-up animate-delay-${(i % 2) * 100}`}>
                      <MatchCard match={m} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
              <div className="animate-slide-up animate-delay-100">
                <StandingsTable teams={standings.groupA} groupName="A" />
              </div>
              <div className="animate-slide-up animate-delay-200">
                <StandingsTable teams={standings.groupB} groupName="B" />
              </div>
              <div className="md:col-span-2 rounded-xl p-3 text-xs animate-slide-up animate-delay-300 flex items-center gap-2" style={{ background: '#0A1628', border: '1px solid #1a2a4a', color: '#A1BDCB' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Top 2 from each group qualify for Semi Finals &nbsp;|&nbsp; P=Played W=Won L=Lost Pts=Points NRR=Net Run Rate
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
      style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
      <div className="mb-3" style={{ color: '#F3C570' }}>{icon}</div>
      <p className="font-semibold" style={{ color: '#ffffff' }}>{text}</p>
      <p className="text-xs mt-1" style={{ color: '#A1BDCB' }}>{sub}</p>
    </div>
  );
}
