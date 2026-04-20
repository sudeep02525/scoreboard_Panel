import Link from 'next/link';

export default function MatchCard({ match }) {
  const statusStyle = {
    live: { background: '#F9A2B2', color: '#00061C', label: '● LIVE' },
    scheduled: { background: '#A1BDCB', color: '#00061C', label: 'UPCOMING' },
    completed: { background: '#1a2a4a', color: '#A1BDCB', label: 'DONE' },
  };
  const s = statusStyle[match.status] || statusStyle.scheduled;

  return (
    <Link href={`/matches/${match._id}`}>
      <div className="rounded-xl p-4 hover:scale-[1.01] transition-transform cursor-pointer"
        style={{ background: '#0A1628', border: '1px solid #1a2a4a' }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium" style={{ color: '#A1BDCB' }}>{match.group} • {match.ground}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={s}>{s.label}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-center flex-1">
            <p className="font-bold text-sm" style={{ color: '#ffffff' }}>{match.teamA?.name}</p>
            {match.innings1 && (
              <p className="text-xl font-bold mt-1" style={{ color: '#F3C570' }}>
                {match.innings1.runs}/{match.innings1.wickets}
                <span className="text-xs ml-1" style={{ color: '#A1BDCB' }}>({match.innings1.overs}.{match.innings1.balls})</span>
              </p>
            )}
          </div>

          <div className="text-xs font-bold px-2" style={{ color: '#1a2a4a', background: '#F3C570', borderRadius: '6px', padding: '2px 8px' }}>VS</div>

          <div className="text-center flex-1">
            <p className="font-bold text-sm" style={{ color: '#ffffff' }}>{match.teamB?.name}</p>
            {match.innings2 && (
              <p className="text-xl font-bold mt-1" style={{ color: '#F3C570' }}>
                {match.innings2.runs}/{match.innings2.wickets}
                <span className="text-xs ml-1" style={{ color: '#A1BDCB' }}>({match.innings2.overs}.{match.innings2.balls})</span>
              </p>
            )}
          </div>
        </div>

        {match.result?.description && (
          <p className="text-center text-xs mt-3 font-semibold" style={{ color: '#F3C570' }}>{match.result.description}</p>
        )}
      </div>
    </Link>
  );
}
