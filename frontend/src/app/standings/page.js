'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
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
    <div className="min-h-screen" style={{ background: '#00061C' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#F3C570' }}>📊 Group Standings</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <StandingsTable teams={standings.groupA} groupName="A" />
          <StandingsTable teams={standings.groupB} groupName="B" />
        </div>
        <div className="mt-6 rounded-xl p-4 text-xs" style={{ background: '#0A1628', border: '1px solid #1a2a4a', color: '#A1BDCB' }}>
          <p>✓ Top 2 teams from each group qualify for Semi Finals</p>
          <p className="mt-1">P = Played | W = Won | L = Lost | Pts = Points | NRR = Net Run Rate</p>
        </div>
      </div>
    </div>
  );
}
