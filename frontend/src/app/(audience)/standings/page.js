'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UserLayout from '@/components/UserLayout';
import StandingsTable from '@/components/StandingsTable';
import { api } from '@/lib/api';

export default function StandingsPage() {
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });

  useEffect(() => {
    api.get('/standings').then((data) => {
      if (data.groupA) setStandings(data);
    });
  }, []);

  return (
    <UserLayout>
      <div className="min-h-screen bg-linear-to-br from-[#0a0e1a] via-[#0d1117] to-[#080c14]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-8 text-white font-inter"
          >
            📊 <span className="text-yellow-500">GROUP STANDINGS</span>
          </motion.h1>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StandingsTable teams={standings.groupA} groupName="A" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StandingsTable teams={standings.groupB} groupName="B" />
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 rounded-2xl p-6 text-sm bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 text-gray-400 font-inter"
          >
            <p className="flex items-center gap-2">
              <span className="text-yellow-500">✓</span> Top 2 teams from each group qualify for Semi Finals
            </p>
            <p className="mt-2 text-xs text-gray-500">
              P = Played | W = Won | L = Lost | Pts = Points | NRR = Net Run Rate
            </p>
          </motion.div>
        </div>
      </div>
    </UserLayout>
  );
}
