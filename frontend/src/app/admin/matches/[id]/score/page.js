'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function ScorePage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [inningsNum, setInningsNum] = useState(1);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    else api.get(`/matches/${id}`).then((d) => {
      if (d._id) {
        setMatch(d);
        const inn = d.innings1;
        if (inn) setScore({ runs: inn.runs, wickets: inn.wickets, overs: inn.overs, balls: inn.balls, extras: inn.extras || 0 });
      }
    });
  }, [loading, user, id]);

  const handleInningsSwitch = (num) => {
    setInningsNum(num);
    const inn = num === 1 ? match?.innings1 : match?.innings2;
    if (inn) setScore({ runs: inn.runs || 0, wickets: inn.wickets || 0, overs: inn.overs || 0, balls: inn.balls || 0, extras: inn.extras || 0 });
    else setScore({ runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 });
  };

  const handleSave = async () => {
    const inningsTeam = inningsNum === 1 ? match?.teamA?._id : match?.teamB?._id;
    const res = await api.put(`/matches/${id}/score`, { inningsNum, ...score, [`innings${inningsNum}`]: { team: inningsTeam, ...score } });
    if (res._id) { setMsg('Score updated!'); setMatch(res); }
    else setMsg(res.message || 'Error');
  };

  if (!match) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-8 text-gray-400">Loading...</div></div>;

  const battingTeam = inningsNum === 1 ? match.teamA : match.teamB;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🎯 Live Scoring</h1>
        <p className="text-gray-500 mb-6">{match.teamA?.name} vs {match.teamB?.name}</p>

        {/* Innings selector */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((n) => (
            <button key={n} onClick={() => handleInningsSwitch(n)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${inningsNum === n ? 'bg-green-700 text-white' : 'bg-white text-gray-600'}`}>
              Innings {n} — {n === 1 ? match.teamA?.name : match.teamB?.name}
            </button>
          ))}
        </div>

        {msg && <p className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">{msg}</p>}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">{battingTeam?.name} Batting</h2>

          <div className="grid grid-cols-2 gap-4">
            {[['runs', 'Runs'], ['wickets', 'Wickets'], ['overs', 'Overs'], ['balls', 'Balls (current over)'], ['extras', 'Extras']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="number" min={0} value={score[key]}
                  onChange={(e) => setScore({ ...score, [key]: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>

          {/* Quick add buttons */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Add Runs</p>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button key={r} onClick={() => setScore((s) => ({ ...s, runs: s.runs + r, balls: s.balls + 1 }))}
                  className={`w-10 h-10 rounded-full font-bold text-sm transition ${r === 4 ? 'bg-blue-100 text-blue-700' : r === 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'} hover:opacity-80`}>
                  {r}
                </button>
              ))}
              <button onClick={() => setScore((s) => ({ ...s, wickets: Math.min(s.wickets + 1, 10), balls: s.balls + 1 }))}
                className="px-3 h-10 rounded-full bg-red-100 text-red-700 font-bold text-sm hover:opacity-80">
                W
              </button>
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">
            Save Score
          </button>
        </div>
      </div>
    </div>
  );
}
