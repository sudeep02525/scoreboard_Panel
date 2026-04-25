'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import UserLayout from '@/components/UserLayout';
import { api } from '@/lib/api';

export default function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const fetch = () => api.get(`/matches/${id}`).then((d) => { if (d._id) setMatch(d); });
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (!match) return (
    <UserLayout>
      <div className="flex items-center justify-center h-64" style={{ color: '#A1BDCB' }}>Loading match...</div>
    </UserLayout>
  );

  const renderInnings = (innings, label) => {
    if (!innings?.team) return null;
    return (
      <div className="rounded-xl p-4 mb-4" style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
        <h3 className="font-bold mb-3 text-sm" style={{ color: '#F3C570' }}>
          {label} — {innings.runs}/{innings.wickets}
          <span className="ml-2 text-xs font-normal" style={{ color: '#A1BDCB' }}>({innings.overs}.{innings.balls} ov)</span>
        </h3>
        {innings.batting?.length > 0 && (
          <table className="w-full text-xs mb-4">
            <thead style={{ borderBottom: '1px solid #1a2a4a', color: '#A1BDCB' }}>
              <tr>
                <th className="text-left py-1.5">Batter</th>
                <th className="py-1.5 text-center">R</th>
                <th className="py-1.5 text-center">B</th>
                <th className="py-1.5 text-center">4s</th>
                <th className="py-1.5 text-center">6s</th>
                <th className="py-1.5 text-center">SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batting.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1f3a' }}>
                  <td className="py-1.5">
                    <span className="font-medium" style={{ color: '#ffffff' }}>{b.player?.name || 'Player'}</span>
                    <span className="text-xs ml-1" style={{ color: '#A1BDCB' }}>{b.status}</span>
                  </td>
                  <td className="text-center font-bold py-1.5" style={{ color: '#F3C570' }}>{b.runs}</td>
                  <td className="text-center py-1.5" style={{ color: '#A1BDCB' }}>{b.balls}</td>
                  <td className="text-center py-1.5" style={{ color: '#A1BDCB' }}>{b.fours}</td>
                  <td className="text-center py-1.5" style={{ color: '#F8DB7D' }}>{b.sixes}</td>
                  <td className="text-center py-1.5" style={{ color: '#A1BDCB' }}>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {innings.bowling?.length > 0 && (
          <table className="w-full text-xs">
            <thead style={{ borderBottom: '1px solid #1a2a4a', color: '#A1BDCB' }}>
              <tr>
                <th className="text-left py-1.5">Bowler</th>
                <th className="py-1.5 text-center">O</th>
                <th className="py-1.5 text-center">R</th>
                <th className="py-1.5 text-center">W</th>
                <th className="py-1.5 text-center">Eco</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowling.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1f3a' }}>
                  <td className="py-1.5 font-medium" style={{ color: '#ffffff' }}>{b.player?.name || 'Player'}</td>
                  <td className="text-center py-1.5" style={{ color: '#A1BDCB' }}>{b.overs}</td>
                  <td className="text-center py-1.5" style={{ color: '#A1BDCB' }}>{b.runs}</td>
                  <td className="text-center py-1.5 font-bold" style={{ color: '#F3C570' }}>{b.wickets}</td>
                  <td className="text-center py-1.5" style={{ color: '#A1BDCB' }}>{b.overs > 0 ? (b.runs / b.overs).toFixed(1) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Match Header */}
        <div className="rounded-2xl p-4 sm:p-6 mb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #000D27, #0A1628)', border: '1px solid #1a2a4a' }}>
          <p className="text-xs mb-3" style={{ color: '#A1BDCB' }}>{match.group} • {match.ground}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div>
              <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{match.teamA?.name}</p>
              {match.innings1 && <p className="text-3xl font-bold mt-1" style={{ color: '#F3C570' }}>{match.innings1.runs}/{match.innings1.wickets}</p>}
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: '#F3C570', color: '#00061C' }}>VS</div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{match.teamB?.name}</p>
              {match.innings2 && <p className="text-3xl font-bold mt-1" style={{ color: '#F3C570' }}>{match.innings2.runs}/{match.innings2.wickets}</p>}
            </div>
          </div>
          {match.result?.description && (
            <p className="mt-3 font-semibold text-sm" style={{ color: '#F8DB7D' }}>{match.result.description}</p>
          )}
          <span className="mt-3 inline-block text-xs px-3 py-1 rounded-full font-bold"
            style={match.status === 'live'
              ? { background: '#EF4444', color: '#ffffff' }
              : match.status === 'completed'
              ? { background: '#1a2a4a', color: '#A1BDCB' }
              : { background: '#A1BDCB', color: '#00061C' }}>
            {match.status === 'live' ? '● LIVE' : match.status.toUpperCase()}
          </span>
        </div>

        {renderInnings(match.innings1, `${match.teamA?.name} Innings`)}
        {renderInnings(match.innings2, `${match.teamB?.name} Innings`)}
      </div>
    </UserLayout>
  );
}
