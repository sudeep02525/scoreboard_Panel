export default function StandingsTable({ teams, groupName }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1a2a4a' }}>
      <div className="px-4 py-2.5 font-bold text-sm flex items-center gap-2"
        style={{ background: 'linear-gradient(90deg, #000D27, #0A1628)', color: '#F3C570', borderBottom: '1px solid #1a2a4a' }}>
        <span>Group {groupName}</span>
      </div>
      <table className="w-full text-xs" style={{ background: '#0A1628' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a2a4a', color: '#A1BDCB' }}>
            <th className="text-left px-4 py-2">#</th>
            <th className="text-left px-4 py-2">Team</th>
            <th className="px-2 py-2 text-center">P</th>
            <th className="px-2 py-2 text-center">W</th>
            <th className="px-2 py-2 text-center">L</th>
            <th className="px-2 py-2 text-center">Pts</th>
            <th className="px-2 py-2 text-center">NRR</th>
          </tr>
        </thead>
        <tbody>
          {teams && teams.length > 0 ? teams.map((team, i) => (
            <tr key={team._id} style={{ borderBottom: '1px solid #0d1f3a' }}>
              <td className="px-4 py-2.5" style={{ color: '#A1BDCB' }}>{i + 1}</td>
              <td className="px-4 py-2.5">
                <span className="font-semibold" style={{ color: '#ffffff' }}>{team.name}</span>
                {i < 2 && <span className="ml-2 text-xs" style={{ color: '#F3C570' }}>✓</span>}
              </td>
              <td className="px-2 py-2.5 text-center" style={{ color: '#A1BDCB' }}>{team.stats.played}</td>
              <td className="px-2 py-2.5 text-center font-bold" style={{ color: '#F3C570' }}>{team.stats.won}</td>
              <td className="px-2 py-2.5 text-center" style={{ color: '#F9A2B2' }}>{team.stats.lost}</td>
              <td className="px-2 py-2.5 text-center font-bold" style={{ color: '#F8DB7D' }}>{team.stats.points}</td>
              <td className="px-2 py-2.5 text-center" style={{ color: '#A1BDCB' }}>{team.stats.nrr?.toFixed(2)}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="px-4 py-4 text-center text-xs" style={{ color: '#1a2a4a' }}>No teams yet</td>
            </tr>
          )}
        </tbody>
      </table>
      {teams && teams.length > 0 && (
        <div className="px-4 py-2 text-xs" style={{ background: '#000D27', color: '#A1BDCB', borderTop: '1px solid #1a2a4a' }}>
          ✓ Top 2 qualify for Semi Finals
        </div>
      )}
    </div>
  );
}
