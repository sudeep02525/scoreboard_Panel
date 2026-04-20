'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
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
    <div className="min-h-screen" style={{ background: '#00061C' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#F3C570' }}>🗓️ Matches</h1>

        {/* Stage tabs */}
        <div className="flex gap-2 mb-6">
          {STAGES.map((s) => (
            <button key={s} onClick={() => setActiveStage(s)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition"
              style={activeStage === s
                ? { background: '#F3C570', color: '#00061C' }
                : { background: '#0A1628', color: '#A1BDCB', border: '1px solid #1a2a4a' }}>
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>

        {activeStage === 'group' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-bold mb-3 text-sm" style={{ color: '#A1BDCB' }}>Group A — Ground 1</h2>
              <div className="space-y-3">
                {groupAMatches.length === 0
                  ? <p className="text-sm" style={{ color: '#1a2a4a' }}>No matches yet</p>
                  : groupAMatches.map((m) => <MatchCard key={m._id} match={m} />)}
              </div>
            </div>
            <div>
              <h2 className="font-bold mb-3 text-sm" style={{ color: '#A1BDCB' }}>Group B — Ground 2</h2>
              <div className="space-y-3">
                {groupBMatches.length === 0
                  ? <p className="text-sm" style={{ color: '#1a2a4a' }}>No matches yet</p>
                  : groupBMatches.map((m) => <MatchCard key={m._id} match={m} />)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-xl">
            {filtered.length === 0
              ? <p className="text-sm" style={{ color: '#A1BDCB' }}>No matches yet</p>
              : filtered.map((m) => <MatchCard key={m._id} match={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
