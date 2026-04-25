export default function StandingsTable({ teams, groupName }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(201, 162, 39, 0.03)',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 800, color: 'var(--bg-primary)',
        }}>{groupName}</div>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--gold)' }}>Group {groupName}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '400px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {['#', 'Team', 'P', 'W', 'L', 'Pts', 'NRR'].map((h, i) => (
              <th key={h} style={{
                textAlign: i < 2 ? 'left' : 'center',
                padding: i === 0 ? '11px 22px' : '11px 10px',
                color: 'var(--text-muted)', fontWeight: 600, fontSize: '10px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams && teams.length > 0 ? teams.map((team, i) => (
            <tr key={team._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201, 162, 39, 0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '13px 22px', color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: '13px 10px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{team.name}</span>
                {i < 2 && (
                  <span style={{
                    marginLeft: '8px', fontSize: '9px', fontWeight: 700,
                    padding: '2px 6px', borderRadius: '4px',
                    background: 'rgba(34, 197, 94, 0.08)', color: 'var(--green)',
                    border: '1px solid rgba(34, 197, 94, 0.12)',
                  }}>Q</span>
                )}
              </td>
              <td style={{ padding: '13px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>{team.stats.played}</td>
              <td style={{ padding: '13px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--green)' }}>{team.stats.won}</td>
              <td style={{ padding: '13px 10px', textAlign: 'center', color: 'var(--red)' }}>{team.stats.lost}</td>
              <td style={{ padding: '13px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--gold)', fontSize: '13px' }}>{team.stats.points}</td>
              <td style={{ padding: '13px 10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '11px' }}>{team.stats.nrr?.toFixed(2)}</td>
            </tr>
          )) : (
            <tr><td colSpan={7} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>No teams yet</td></tr>
          )}
        </tbody>
      </table>
      </div>

      {teams && teams.length > 0 && (
        <div style={{
          padding: '11px 22px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px',
          borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.08)', color: 'var(--green)', border: '1px solid rgba(34, 197, 94, 0.12)' }}>Q</span>
          Top 2 qualify for Semi Finals
        </div>
      )}
    </div>
  );
}
