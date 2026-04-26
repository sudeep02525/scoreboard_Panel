'use client';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import { api } from '@/lib/api';

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
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

  const tabs = [
    { 
      id: 'live', 
      label: 'Live', 
      count: liveMatches.length, 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
    },
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      count: upcoming.length, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    { 
      id: 'results', 
      label: 'Results', 
      count: completed.length, 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    },
    { 
      id: 'standings', 
      label: 'Standings', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 p-1 shadow-xl">
                <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                  <Image src="/logo.png" alt="Logo" width={64} height={64} unoptimized className="object-contain" />
                </div>
              </div>
              {liveMatches.length > 0 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 border-4 border-slate-900 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-black text-white">{liveMatches.length}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                APL <span className="text-yellow-500">Scoreboard</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base flex items-center gap-2 justify-center md:justify-start">
                {liveMatches.length > 0 ? (
                  <>
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                    <span>{liveMatches.length} match{liveMatches.length > 1 ? 'es' : ''} live right now!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>No live matches. Check upcoming fixtures.</span>
                  </>
                )}
              </p>
            </div>

            {liveMatches.length > 0 && (
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-500/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-black text-red-400 uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/20'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'live' && (
              <Section 
                matches={liveMatches}
                emptyIcon={<svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                emptyText="No live matches right now"
                emptySub="Matches will appear here when they start"
              />
            )}
            {activeTab === 'upcoming' && (
              <Section 
                matches={upcoming}
                emptyIcon={<svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                emptyText="No upcoming matches"
                emptySub="Check back later for scheduled fixtures"
              />
            )}
            {activeTab === 'results' && (
              <Section 
                matches={completed}
                emptyIcon={<svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                emptyText="No results yet"
                emptySub="Completed matches will appear here"
              />
            )}
            {activeTab === 'standings' && (
              <div className="grid md:grid-cols-2 gap-6">
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
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-16 text-center shadow-xl">
        <div className="mb-4 flex justify-center">{emptyIcon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{emptyText}</h3>
        <p className="text-slate-400">{emptySub}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
      {matches.map((m) => <MatchCard key={m._id} match={m} />)}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-slate-700 border-t-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
        <p className="text-slate-400 font-semibold">Loading matches...</p>
      </div>
    </div>
  );
}
