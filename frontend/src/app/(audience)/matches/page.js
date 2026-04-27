'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UserLayout from '@/components/UserLayout';
import MatchCard from '@/components/MatchCard';
import { api } from '@/lib/api';

const STAGES = ['group', 'semi', 'final'];
const STAGE_LABELS = { group: 'Group Stage', semi: 'Semi Finals', final: 'Final' };

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [activeStage, setActiveStage] = useState('group');

  useEffect(() => {
    api.get('/matches').then((data) => {
      if (Array.isArray(data)) setMatches(data);
    });
  }, []);

  const filtered = matches.filter((m) => m.stage === activeStage);
  const groupAMatches = filtered.filter((m) => m.group === 'A');
  const groupBMatches = filtered.filter((m) => m.group === 'B');

  return (
    <UserLayout>
      <div className="min-h-screen bg-linear-to-br from-[#0a0e1a] via-[#0d1117] to-[#080c14]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-8 text-white font-inter"
          >
            🗓️ <span className="text-yellow-500">MATCHES</span>
          </motion.h1>

          {/* Stage tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-8"
          >
            {STAGES.map((s, index) => (
              <motion.button 
                key={s} 
                onClick={() => setActiveStage(s)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 font-inter ${
                  activeStage === s
                    ? 'bg-linear-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/30'
                    : 'bg-linear-to-br from-[#1a1f2e] to-[#0f1419] text-gray-400 border border-yellow-500/20 hover:border-yellow-500/40'
                }`}
              >
                {STAGE_LABELS[s]}
              </motion.button>
            ))}
          </motion.div>

          {activeStage === 'group' ? (
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-bold mb-4 text-lg text-yellow-500 font-inter">GROUP A — GROUND 1</h2>
                <div className="space-y-4">
                  {groupAMatches.length === 0
                    ? <p className="text-sm text-gray-500 font-inter">No matches yet</p>
                    : groupAMatches.map((m, i) => (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <MatchCard match={m} />
                        </motion.div>
                      ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-bold mb-4 text-lg text-yellow-500 font-inter">GROUP B — GROUND 2</h2>
                <div className="space-y-4">
                  {groupBMatches.length === 0
                    ? <p className="text-sm text-gray-500 font-inter">No matches yet</p>
                    : groupBMatches.map((m, i) => (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <MatchCard match={m} />
                        </motion.div>
                      ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 max-w-2xl"
            >
              {filtered.length === 0
                ? <p className="text-sm text-gray-400 font-inter">No matches yet</p>
                : filtered.map((m, i) => (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <MatchCard match={m} />
                    </motion.div>
                  ))}
            </motion.div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
