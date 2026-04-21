'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminSchedule() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overs, setOvers] = useState(6);
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [loading, user]);

  const generate = async (type) => {
    setGenerating(true);
    setMsg('');
    const endpoint = type === 'group' ? '/matches/generate-schedule'
      : type === 'semi' ? '/matches/generate-semis'
      : '/matches/generate-final';
    const res = await api.post(endpoint, { overs, date });
    setMsg(res.message || res.error || JSON.stringify(res));
    setGenerating(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#00061C' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#F3C570' }}>Generate Schedule</h1>

        <div className="rounded-xl p-6 space-y-4" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
          {msg && <p className="p-3 rounded-lg text-sm" style={{ background: 'rgba(243, 197, 112, 0.1)', color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }}>{msg}</p>}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#A1BDCB' }}>Overs per match</label>
              <input type="number" min={1} max={50} value={overs}
                onChange={(e) => setOvers(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#A1BDCB' }}>Start Date</label>
              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                style={{ background: '#000D27', border: '1px solid #1a2a4a', color: '#ffffff' }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="rounded-xl p-4" style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
              <h3 className="font-semibold mb-1 text-sm" style={{ color: '#ffffff' }}>Step 1 — Group Stage</h3>
              <p className="text-sm mb-3" style={{ color: '#A1BDCB' }}>Generates 6 matches per group (round-robin). Requires 4 teams in each group.</p>
              <button onClick={() => generate('group')} disabled={generating}
                className="px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-bold hover:opacity-90"
                style={{ background: '#F3C570', color: '#00061C' }}>
                Generate Group Fixtures
              </button>
            </div>

            <div className="rounded-xl p-4" style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
              <h3 className="font-semibold mb-1 text-sm" style={{ color: '#ffffff' }}>Step 2 — Semi Finals</h3>
              <p className="text-sm mb-3" style={{ color: '#A1BDCB' }}>Top 2 from each group. Group A 1st vs Group B 2nd & vice versa.</p>
              <button onClick={() => generate('semi')} disabled={generating}
                className="px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-bold hover:opacity-90"
                style={{ background: '#A1BDCB', color: '#00061C' }}>
                Generate Semi Finals
              </button>
            </div>

            <div className="rounded-xl p-4" style={{ background: '#000D27', border: '1px solid #1a2a4a' }}>
              <h3 className="font-semibold mb-1 text-sm" style={{ color: '#ffffff' }}>Step 3 — Final</h3>
              <p className="text-sm mb-3" style={{ color: '#A1BDCB' }}>Both semi final winners. Requires both semis to be completed.</p>
              <button onClick={() => generate('final')} disabled={generating}
                className="px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-bold hover:opacity-90"
                style={{ background: '#F8DB7D', color: '#00061C' }}>
                Generate Final
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
