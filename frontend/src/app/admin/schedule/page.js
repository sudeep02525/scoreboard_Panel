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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🗓️ Generate Schedule</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {msg && <p className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{msg}</p>}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Overs per match</label>
              <input type="number" min={1} max={50} value={overs}
                onChange={(e) => setOvers(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Step 1 — Group Stage</h3>
              <p className="text-sm text-gray-500 mb-3">Generates 6 matches per group (round-robin). Requires 4 teams in each group.</p>
              <button onClick={() => generate('group')} disabled={generating}
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm">
                Generate Group Fixtures
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Step 2 — Semi Finals</h3>
              <p className="text-sm text-gray-500 mb-3">Top 2 from each group. Group A 1st vs Group B 2nd & vice versa.</p>
              <button onClick={() => generate('semi')} disabled={generating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 text-sm">
                Generate Semi Finals
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Step 3 — Final</h3>
              <p className="text-sm text-gray-500 mb-3">Both semi final winners. Requires both semis to be completed.</p>
              <button onClick={() => generate('final')} disabled={generating}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 text-sm font-semibold">
                Generate Final
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
