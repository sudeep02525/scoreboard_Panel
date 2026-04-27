'use client';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    },
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      count: upcoming.length, 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    { 
      id: 'results', 
      label: 'Results', 
      count: completed.length, 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>
    },
    { 
      id: 'standings', 
      label: 'Standings', 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0e1a] via-[#0d1117] to-[#080c14]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* Hero Header - PREMIUM */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-linear-to-br from-[#1a1f2e] to-[#0f1419] rounded-2xl border border-yellow-500/20 p-6 md:p-8 overflow-hidden hover:border-yellow-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10"
        >
          {/* Animated Background Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-radial from-yellow-500/20 via-yellow-500/5 to-transparent rounded-full blur-3xl"
          />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-5">
            {/* Logo with badge */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 rounded-2xl bg-linear-to-br from-yellow-500/30 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center p-2 backdrop-blur-sm shadow-lg shadow-yellow-500/20"
              >
                <Image src="/logo.png" alt="APL Logo" width={72} height={72} className="object-contain" />
              </motion.div>
              {liveMatches.length > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-red-500/50 border-2 border-[#0f1419] font-bebas"
                >
                  {liveMatches.length}
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight font-inter"
              >
                APL <span className="text-yellow-500">SCOREBOARD</span>
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mt-3 text-sm text-gray-400 justify-center md:justify-start font-inter"
              >
                {liveMatches.length > 0 ? (
                  <>
                    <motion.span 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
                    />
                    <span>{liveMatches.length} matches live right now</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>No live matches</span>
                  </>
                )}
              </motion.div>
            </div>

            {liveMatches.length > 0 && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-linear-to-r from-red-950/60 to-red-900/40 border-2 border-red-500/60 shrink-0 backdrop-blur-md shadow-lg shadow-red-500/30"
              >
                <motion.span 
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-red-500"
                />
                <span className="text-sm font-black text-red-500 uppercase tracking-widest font-bebas">LIVE</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1c2333] border-t-[#c8a84b] rounded-full animate-spin"></div>
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
      <div className="bg-[#0d1117] border border-[#1c2333] rounded-2xl p-16 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="mb-4 flex justify-center">{emptyIcon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{emptyText}</h3>
        <p className="text-[#6a8090]">{emptySub}</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {matches.map((m, index) => (
        <motion.div
          key={m._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <MatchCard match={m} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080c12] flex items-center justify-center">
      <div className="text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-[#1c2333] border-t-[#c8a84b] rounded-full animate-spin"></div>
        </div>
        <p className="text-[#6a8090] font-semibold">Loading matches...</p>
      </div>
    </div>
  );
}
