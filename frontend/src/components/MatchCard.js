import Link from 'next/link';

export default function MatchCard({ match }) {
  const isLive = match.status === 'live';
  const isDone = match.status === 'completed';

  return (
    <Link href={`/matches/${match._id}`} style={{ textDecoration: 'none' }}>
      <div className="match-card" style={{ padding: '22px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {match.group} • {match.ground}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '10px', padding: '4px 12px', borderRadius: '6px',
            fontWeight: 700, letterSpacing: '0.06em',
            ...(isLive ? { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)' }
              : isDone ? { background: 'rgba(34, 197, 94, 0.06)', color: 'var(--green)', border: '1px solid rgba(34, 197, 94, 0.1)' }
              : { background: 'rgba(139, 157, 183, 0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }),
          }}>
            {isLive && <span className="pulse-dot" style={{ width: '5px', height: '5px' }} />}
            {isLive ? 'LIVE' : isDone ? 'COMPLETED' : 'UPCOMING'}
          </span>
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>{match.teamA?.name}</p>
            {match.innings1 && (
              <div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)' }}>{match.innings1.runs}</span>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>/{match.innings1.wickets}</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>({match.innings1.overs}.{match.innings1.balls} ov)</p>
              </div>
            )}
          </div>

          <div style={{
            fontSize: '10px', fontWeight: 800, padding: '6px 14px', borderRadius: '8px',
            background: 'rgba(201, 162, 39, 0.06)', color: 'var(--gold)',
            border: '1px solid var(--border-subtle)', letterSpacing: '0.1em',
          }}>VS</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>{match.teamB?.name}</p>
            {match.innings2 && (
              <div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)' }}>{match.innings2.runs}</span>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>/{match.innings2.wickets}</span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>({match.innings2.overs}.{match.innings2.balls} ov)</p>
              </div>
            )}
          </div>
        </div>

        {match.result?.description && (
          <p style={{
            textAlign: 'center', fontSize: '12px', marginTop: '16px', fontWeight: 600,
            padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(201, 162, 39, 0.04)', color: 'var(--gold)', border: '1px solid var(--border-subtle)',
          }}>{match.result.description}</p>
        )}
      </div>
    </Link>
  );
}
